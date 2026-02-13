require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySchema() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is missing in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const schemaPath = path.join(__dirname, '../supabase/schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema.sql...');
        await client.query(sql);
        console.log('✅ Schema applied successfully!');

    } catch (err) {
        console.error('❌ Error applying schema:', err.message);
        if (err.position) {
            console.error('Error position:', err.position);
            // Try to find the line number
            const sql = fs.readFileSync(path.join(__dirname, '../supabase/schema.sql'), 'utf8');
            const lines = sql.substring(0, parseInt(err.position)).split('\n');
            console.error(`Likely near line: ${lines.length}`);
            console.error(`Context: ${lines[lines.length - 1]}`);
        }
    } finally {
        await client.end();
    }
}

applySchema();
