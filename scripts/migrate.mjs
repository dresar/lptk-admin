import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL is not defined in environment variables.');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL...');
  const sql = neon(databaseUrl);

  const sqlFilePath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(sqlFilePath, 'utf8');

  console.log('Executing schema.sql...');
  
  // Split statements by semicolon where appropriate, or run the block
  try {
    // Execute DDL batch
    await sql(schemaSql);
    console.log('✅ Migration executed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
