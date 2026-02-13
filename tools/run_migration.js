require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const sqlPath = path.join(__dirname, '../supabase/migration_v3_1.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing migration_v3_1.sql...');
        await client.query(sql);
        console.log('✅ Migration executed successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        if (err.position) {
            console.error('Error position:', err.position);
        }
    } finally {
        await client.end();
    }
}

runMigration();
