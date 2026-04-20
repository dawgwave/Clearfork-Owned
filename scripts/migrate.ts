#!/usr/bin/env tsx

import { config } from 'dotenv';
import { runMigrations, rollbackMigration, showMigrationStatus, createMigration } from '../src/lib/migrations';
import { testConnection, closePool } from '../src/lib/database';

// Load environment variables
const envResult = config({ path: '.env.local' });
if (envResult.error) {
  console.warn('⚠️  Could not load .env.local file:', envResult.error.message);
}

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