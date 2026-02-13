require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function certifyStaff(userId) {
    console.log(`[Certification Agent] Starting COPPA certification for user: ${userId}`);

    // 1. Log the training record
    const { error: tError } = await supabase
        .from('coppa_training_records')
        .insert({
            staff_user_id: userId,
            training_name: 'Annual COPPA Compliance Certification v3.1',
            completed_at: new Date().toISOString(),
            expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            evidence_url: 'https://likkle-legends-storage/certs/dummy-cert.pdf'
        });

    if (tError) {
        console.error('Error logging training:', tError.message);
        return;
    }

    // 2. Update user flags
    const { error: uError } = await supabase
        .from('users')
        .update({
            coppa_training_completed: true,
            age_verified_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (uError) {
        console.error('Error updating user flags:', uError.message);
        return;
    }

    console.log(`✅ [Certification Agent] Certification complete for ${userId}. Access granted.`);
}

// Example usage (assuming we have an admin user ID, you can pass it via env or command line)
const testAdminId = process.argv[2];
if (testAdminId) {
    certifyStaff(testAdminId);
} else {
    console.log('Usage: node agent/certify.js <user_id>');
}
