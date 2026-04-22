import { query, getConnection } from './database';
import fs from 'fs/promises';
import path from 'path';

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
}

function migrateDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database:
      process.env.DB_DATABASE ||
      process.env.DB_NAME ||
      'clearfork-insurance',
    user: process.env.DB_USERNAME || process.env.DB_USER || 'clearfork_user',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? {} : false,
    charset: 'utf8mb4',
  };
}

const APP_MIGRATIONS_DDL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_executed_at (executed_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

/**
 * mysql-init/setup-production-db.sql used a legacy ledger (INT id, applied_at).
 * The app expects VARCHAR id + executed_at. Rename legacy away and create the app table once.
 */
async function ensureMigrationsTable(): Promise<void> {
  const mysql = require('mysql2/promise');
  const config = migrateDbConfig();
  const connection = await mysql.createConnection(config);
  try {
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'migrations'`,
    );
    if (!(tables as { TABLE_NAME: string }[]).length) {
      await connection.query(APP_MIGRATIONS_DDL);
      return;
    }

    const [cols] = await connection.query(
      `SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'migrations'`,
    );
    const byName = new Map(
      (cols as { COLUMN_NAME: string; DATA_TYPE: string }[]).map((c) => [
        c.COLUMN_NAME,
        c.DATA_TYPE,
      ]),
    );
    const idType = byName.get('id');
    const hasLedger =
      byName.has('executed_at') &&
      (idType === 'varchar' || idType === 'char');

    if (hasLedger) {
      return;
    }

    console.warn(
      '⚠️  Replacing legacy migrations table (INT id / applied_at) with app schema; old table -> migrations_legacy_deprecated',
    );
    await connection.query('DROP TABLE IF EXISTS migrations_legacy_deprecated');
    await connection.query('RENAME TABLE migrations TO migrations_legacy_deprecated');
    await connection.query(APP_MIGRATIONS_DDL);
  } finally {
    await connection.end();
  }
}

/**
 * Get list of executed migrations
 */
async function getExecutedMigrations(): Promise<string[]> {
  await ensureMigrationsTable();
  
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection(migrateDbConfig());
  try {
    const [rows] = await connection.execute('SELECT id FROM migrations ORDER BY executed_at ASC');
    return (rows as { id: string }[]).map(row => row.id);
  } finally {
    await connection.end();
  }
}

/**
 * Mark migration as executed
 */
async function markMigrationExecuted(id: string, name: string): Promise<void> {
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection(migrateDbConfig());
  try {
    await connection.execute('INSERT INTO migrations (id, name) VALUES (?, ?)', [id, name]);
  } finally {
    await connection.end();
  }
}

/**
 * Remove migration from executed list (for rollback)
 */
async function removeMigrationRecord(id: string): Promise<void> {
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection(migrateDbConfig());
  try {
    await connection.execute('DELETE FROM migrations WHERE id = ?', [id]);
  } finally {
    await connection.end();
  }
}

/**
 * Load migration files from migrations directory
 */
async function loadMigrationFiles(): Promise<Migration[]> {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  
  try {
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(file => file.endsWith('.sql')).sort();
    
    const migrations: Migration[] = [];
    
    for (const file of migrationFiles) {
      const fullPath = path.join(migrationsDir, file);
      const content = await fs.readFile(fullPath, 'utf8');
      
      // Parse migration file format
      const parts = content.split('-- DOWN');
      if (parts.length !== 2) {
        throw new Error(`Invalid migration format in ${file}. Expected UP and DOWN sections separated by "-- DOWN"`);
      }
      
      // Strip only a marker line that is exactly `-- UP` (optionally trailing spaces).
      // Do not use `-- UP: …` on the same line — `/^-- UP\s*\n?/m` would match `-- UP`
      // and leave `: …` as bogus SQL.
      const up = parts[0].replace(/^-- UP\s*$/m, '').trim();
      const down = parts[1].trim();
      
      // Extract ID from filename (format: YYYYMMDD_HHMMSS_name.sql)
      const match = file.match(/^(\d{8}_\d{6})_(.+)\.sql$/);
      if (!match) {
        throw new Error(`Invalid migration filename format: ${file}. Expected: YYYYMMDD_HHMMSS_name.sql`);
      }
      
      migrations.push({
        id: match[1],
        name: match[2],
        up,
        down
      });
    }
    
    return migrations;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('Migrations directory not found, creating...');
      await fs.mkdir(migrationsDir, { recursive: true });
      return [];
    }
    throw error;
  }
}

/**
 * Execute a SQL statement with multiple queries
 */
async function executeMultipleStatements(sql: string): Promise<void> {
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection(migrateDbConfig());
  try {
    // Split by semicolons but be careful about semicolons in strings
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        // query(), not execute(): DDL / PREPARE / DEALLOCATE are not supported on the PS protocol.
        await connection.query(statement);
      }
    }
  } finally {
    await connection.end();
  }
}

/**
 * Run pending migrations
 */
export async function runMigrations(): Promise<void> {
  console.log('🔄 Running database migrations...');
  
  const allMigrations = await loadMigrationFiles();
  const executedMigrations = await getExecutedMigrations();
  
  const pendingMigrations = allMigrations.filter(
    migration => !executedMigrations.includes(migration.id)
  );
  
  if (pendingMigrations.length === 0) {
    console.log('✅ No pending migrations');
    return;
  }
  
  console.log(`📋 Found ${pendingMigrations.length} pending migration(s)`);
  
  for (const migration of pendingMigrations) {
    console.log(`⬆️  Running migration: ${migration.id}_${migration.name}`);
    
    try {
      await executeMultipleStatements(migration.up);
      await markMigrationExecuted(migration.id, migration.name);
      console.log(`✅ Migration ${migration.id}_${migration.name} completed`);
    } catch (error) {
      console.error(`❌ Migration ${migration.id}_${migration.name} failed:`, error);
      throw error;
    }
  }
  
  console.log('🎉 All migrations completed successfully');
}

/**
 * Rollback the last migration
 */
export async function rollbackMigration(): Promise<void> {
  console.log('🔄 Rolling back last migration...');
  
  const allMigrations = await loadMigrationFiles();
  const executedMigrations = await getExecutedMigrations();
  
  if (executedMigrations.length === 0) {
    console.log('❌ No migrations to rollback');
    return;
  }
  
  const lastExecutedId = executedMigrations[executedMigrations.length - 1];
  const migration = allMigrations.find(m => m.id === lastExecutedId);
  
  if (!migration) {
    throw new Error(`Migration file not found for ID: ${lastExecutedId}`);
  }
  
  console.log(`⬇️  Rolling back migration: ${migration.id}_${migration.name}`);
  
  try {
    await executeMultipleStatements(migration.down);
    await removeMigrationRecord(migration.id);
    console.log(`✅ Rollback completed for ${migration.id}_${migration.name}`);
  } catch (error) {
    console.error(`❌ Rollback failed for ${migration.id}_${migration.name}:`, error);
    throw error;
  }
}

/**
 * Show migration status
 */
export async function showMigrationStatus(): Promise<void> {
  console.log('📊 Migration Status\n');
  
  const allMigrations = await loadMigrationFiles();
  const executedMigrations = await getExecutedMigrations();
  
  if (allMigrations.length === 0) {
    console.log('No migration files found');
    return;
  }
  
  for (const migration of allMigrations) {
    const status = executedMigrations.includes(migration.id) ? '✅ Executed' : '⏳ Pending';
    console.log(`${status} | ${migration.id}_${migration.name}`);
  }
  
  const pendingCount = allMigrations.length - executedMigrations.length;
  console.log(`\n📈 Summary: ${executedMigrations.length} executed, ${pendingCount} pending`);
}

/**
 * Create a new migration file template
 */
export async function createMigration(name: string): Promise<void> {
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error('Migration name must contain only letters, numbers, underscores, and hyphens');
  }
  
  const timestamp = new Date().toISOString()
    .replace(/[-:T]/g, '')
    .replace(/\..+/, '')
    .slice(0, 15); // YYYYMMDD_HHMMSS
  
  const filename = `${timestamp}_${name}.sql`;
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const filepath = path.join(migrationsDir, filename);
  
  await fs.mkdir(migrationsDir, { recursive: true });
  
  const template = `-- UP
-- Add your migration SQL here
-- Example:
-- CREATE TABLE example (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(255) NOT NULL
-- );

-- DOWN
-- Add your rollback SQL here
-- Example:
-- DROP TABLE IF EXISTS example;
`;
  
  await fs.writeFile(filepath, template);
  console.log(`✅ Created migration file: ${filename}`);
}