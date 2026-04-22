#!/usr/bin/env tsx

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { runMigrations, rollbackMigration, showMigrationStatus, createMigration } from '../src/lib/migrations';
import { testConnection, closePool } from '../src/lib/database';

function loadEnvFiles(): void {
  const explicit = process.env.MIGRATE_ENV_FILE;
  if (explicit) {
    config({ path: resolve(process.cwd(), explicit) });
    return;
  }
  const prod = resolve(process.cwd(), '.env.production');
  const staging = resolve(process.cwd(), '.env.staging');
  const local = resolve(process.cwd(), '.env.local');
  let any = false;
  if (existsSync(prod)) {
    config({ path: prod });
    any = true;
  }
  if (existsSync(staging)) {
    config({ path: staging });
    any = true;
  }
  if (existsSync(local)) {
    config({ path: local, override: true });
    any = true;
  }
  if (!any) {
    console.warn(
      '⚠️  No env files on disk for migrate — using process.env only (normal in Docker with env_file)',
    );
  }
}

loadEnvFiles();

// Debug environment variables (without showing sensitive data)
if (process.env.DEBUG_MIGRATION) {
  console.log('🔧 Environment check:');
  console.log('  DB_HOST:', process.env.DB_HOST || 'localhost');
  console.log('  DB_PORT:', process.env.DB_PORT || '3306'); 
  console.log('  DB_DATABASE:', process.env.DB_DATABASE || 'clearfork-insurance');
  console.log('  DB_USERNAME:', process.env.DB_USERNAME || 'clearfork_user');
  console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET');
  console.log();
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  console.log('🔧 Clearfork Insurance Migration Tool\n');

  // Test database connection first
  console.log('🔍 Testing database connection...');
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed. Check your .env.local configuration.');
    process.exit(1);
  }
  console.log('✅ Database connection successful\n');

  try {
    switch (command) {
      case 'up':
      case 'migrate':
        await runMigrations();
        break;
        
      case 'down':
      case 'rollback':
        await rollbackMigration();
        break;
        
      case 'status':
        await showMigrationStatus();
        break;
        
      case 'create':
        const name = args[0];
        if (!name) {
          console.error('❌ Migration name is required. Usage: npm run migrate:create <name>');
          process.exit(1);
        }
        await createMigration(name);
        break;
        
      default:
        console.log('Usage:');
        console.log('  npm run migrate        - Run pending migrations');
        console.log('  npm run migrate:status - Show migration status');
        console.log('  npm run migrate:down   - Rollback last migration');
        console.log('  npm run migrate:create <name> - Create new migration file');
        break;
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main().catch(console.error);