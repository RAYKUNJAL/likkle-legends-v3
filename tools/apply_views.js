require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyViews() {
    const connectionString = process.env.DATABASE_URL;
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const sqlPath = path.join(__dirname, '../supabase/apply_views.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');

        // Add DROP VIEW IF EXISTS for each view
        const viewNames = [
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

        let dropSql = viewNames.map(name => `DROP VIEW IF EXISTS ${name} CASCADE;`).join('\n');

        console.log('Applying drops and views...');
        await client.query(dropSql + '\n' + sql);
        console.log('✅ Views applied/refreshed successfully!');

    } catch (err) {
        console.error('❌ Error applying views:', err.message);
    } finally {
        await client.end();
    }
}

applyViews();
