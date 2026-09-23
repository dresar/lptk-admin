import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Split a SQL file into individual statements handling $$ dollar-quoted blocks.
 */
function splitSqlStatements(sqlText) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarTag = '';
  let i = 0;

  while (i < sqlText.length) {
    if (!inDollarQuote) {
      const dollarMatch = sqlText.slice(i).match(/^(\$[a-zA-Z0-9_]*\$)/);
      if (dollarMatch) {
        inDollarQuote = true;
        dollarTag = dollarMatch[1];
        current += dollarTag;
        i += dollarTag.length;
        continue;
      }
    } else {
      if (sqlText.slice(i).startsWith(dollarTag)) {
        current += dollarTag;
        i += dollarTag.length;
        inDollarQuote = false;
        dollarTag = '';
        continue;
      }
    }

    const char = sqlText[i];

    if (!inDollarQuote && char === ';') {
      current += char;
      const trimmed = current.trim();
      if (trimmed && trimmed !== ';') {
        statements.push(trimmed);
      }
      current = '';
    } else {
      current += char;
    }
    i++;
  }

  const trimmed = current.trim();
  if (trimmed && trimmed !== ';') statements.push(trimmed);

  return statements;
}

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL is not defined in environment variables.');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL...');

  const sqlFilePath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(sqlFilePath, 'utf8');

  console.log('Executing schema.sql...');

  try {
    const statements = splitSqlStatements(schemaSql);
    const filtered = statements.filter(s => {
      const t = s.replace(/--[^\n]*/g, '').trim();
      return t.length > 0;
    });
    console.log(`Found ${filtered.length} SQL statements to execute.`);

    // Use pg (standard postgres) since neon serverless tagged template 
    // doesn't support raw string execution directly
    // We'll use the neon http driver with unsafe raw queries via neon config
    const { Client } = await import('pg');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();

    let successCount = 0;
    let errorCount = 0;

    for (let idx = 0; idx < filtered.length; idx++) {
      const stmt = filtered[idx];
      try {
        await client.query(stmt);
        successCount++;
        process.stdout.write(`\r  Progress: ${idx + 1}/${filtered.length} ✓`);
      } catch (stmtErr) {
        // 42701 = column already exists, 42P07 = table already exists, 23505 = unique violation
        if (['42701', '42P07', '23505', '42710'].includes(stmtErr.code)) {
          successCount++;
          process.stdout.write(`\r  Progress: ${idx + 1}/${filtered.length} (skip)`);
        } else {
          errorCount++;
          console.error(`\n⚠️  Statement ${idx + 1} error (${stmtErr.code}): ${stmtErr.message}`);
          console.error('  >> ' + stmt.slice(0, 150).replace(/\n/g, ' '));
        }
      }
    }

    await client.end();
    console.log(`\n✅ Migration done! Success: ${successCount}, Errors: ${errorCount}`);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
