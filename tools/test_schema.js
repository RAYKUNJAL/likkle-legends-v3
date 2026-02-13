require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testViews() {
    const views = [
        'v_admin_kpis_today',
        'v_admin_ai_usage_30d',
        'v_admin_lead_sources_7d',
        'v_admin_subscriptions_breakdown',
        'v_admin_jobs_queue',
        'v_admin_contest_live_status',
        'v_admin_affiliate_performance',
        'v_coppa_consent_coverage',
        'v_coppa_pending_requests',
        'v_coppa_vendor_health',
        'v_coppa_retention_enforcement',
        'v_coppa_admin_access_log',
        'v_coppa_incident_dashboard',
        'v_coppa_metrics_today'
    ];

    console.log('--- Testing Views ---');
    for (const view of views) {
        const { data, error } = await supabase.from(view).select('*').limit(1);
        if (error) {
            console.error(`❌ View "${view}" failed:`, error.message);
        } else {
            console.log(`✅ View "${view}" is accessible.`);
        }
    }
}

async function testRPCs() {
    console.log('\n--- Testing RPCs ---');
    const rpcs = [
        'rpc_check_ai_limit',
        'rpc_verify_parental_consent'
    ];

    for (const rpc of rpcs) {
        // We try to call them with dummy values; they might fail if logic depends on data, but we check if they exist
        const { data, error } = await supabase.rpc(rpc, {
            p_user_id: '00000000-0000-0000-0000-000000000000',
            p_feature: 'story_studio',
            p_child_id: '00000000-0000-0000-0000-000000000000',
            p_scope: 'basic_platform'
        });

        if (error && error.message.includes('function') && error.message.includes('does not exist')) {
            console.error(`❌ RPC "${rpc}" does not exist.`);
        } else {
            console.log(`✅ RPC "${rpc}" exists (called, result may be null/error due to dummy data).`);
        }
    }
}

async function runTests() {
    await testViews();
    await testRPCs();
}

runTests();
