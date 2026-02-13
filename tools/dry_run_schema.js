require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function dryRunSchema() {
    const connectionString = process.env.DATABASE_URL;
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const schemaPath = path.join(__dirname, '../supabase/schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Starting DRY RUN (Transaction with Rollback)...');

        // We wrap in BEGIN and ROLLBACK
        // NOTE: This will still fail if types/tables ALREADY exist.
        // To truely test the syntax, we might need a blank schema or just ignore already-exists errors.

        await client.query('BEGIN');

        // We run the SQL. In pg, this might fail after the first error.
        try {
            await client.query(sql);
            console.log('✅ SQL is syntactically correct and references are valid!');
        } catch (sqlErr) {
            console.error('❌ SQL Validation Error:', sqlErr.message);
            if (sqlErr.position) {
                const lines = sql.substring(0, parseInt(sqlErr.position)).split('\n');
                console.error(`Approx. Line: ${lines.length}`);
                console.error(`Context: ${lines[lines.length - 1]}`);
            }
        }

        await client.query('ROLLBACK');
        console.log('Rollback complete (Database remains unchanged).');

    } catch (err) {
        console.error('Fatal Connection Error:', err.message);
    } finally {
        await client.end();
    }
}

dryRunSchema();
