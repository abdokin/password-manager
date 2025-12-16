import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as fs from "fs";
import * as path from "path";
import { afterAll, beforeAll, beforeEach } from "vitest";

// Test database paths
const TEST_MAIN_DB = path.join(__dirname, "../test-main.db");
const TEST_TENANT_DB_DIR = path.join(__dirname, "../test-tenants");

// Initialize test database schema
export async function initTestMainDb() {
  const sqlite = new Database(TEST_MAIN_DB);
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite);

  // Create tables manually for testing (simpler than migrations)
  // Use IF NOT EXISTS to avoid errors if tables already exist
  sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        email_verified INTEGER,
        two_factor_enabled INTEGER DEFAULT 0,
        two_factor_secret TEXT,
        backup_codes TEXT,
        last_login INTEGER,
        login_attempts INTEGER DEFAULT 0,
        locked_until INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        plan TEXT NOT NULL DEFAULT 'free',
        max_members INTEGER NOT NULL DEFAULT 5,
        max_passwords INTEGER NOT NULL DEFAULT 100,
        subscription_id TEXT,
        subscription_status TEXT DEFAULT 'active',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS organization_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        organization_id INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        joined_at INTEGER NOT NULL,
        invited_by INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS organization_invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        token TEXT NOT NULL UNIQUE,
        invited_by INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        accepted_at INTEGER,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS verification_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

  sqlite.close();
}

async function initTestTenantDb(orgId: number) {
  const dbPath = path.join(TEST_TENANT_DB_DIR, `tenant-${orgId}.db`);

  if (!fs.existsSync(dbPath)) {
    const sqlite = new Database(dbPath);
    sqlite.pragma("foreign_keys = ON");

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        url TEXT,
        category_id INTEGER,
        notes TEXT,
        shared_with TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        last_used INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS password_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password_id INTEGER NOT NULL,
        old_password TEXT NOT NULL,
        changed_at INTEGER NOT NULL,
        changed_by INTEGER,
        FOREIGN KEY (password_id) REFERENCES passwords(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS shared_passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password_id INTEGER NOT NULL,
        shared_with_user_id INTEGER NOT NULL,
        permission TEXT NOT NULL DEFAULT 'view',
        shared_at INTEGER NOT NULL,
        shared_by INTEGER NOT NULL,
        FOREIGN KEY (password_id) REFERENCES passwords(id) ON DELETE CASCADE
      );
    `);

    sqlite.close();
  }
}

// Clean up test databases before and after tests
beforeAll(async () => {
  // Create test tenant directory
  if (!fs.existsSync(TEST_TENANT_DB_DIR)) {
    fs.mkdirSync(TEST_TENANT_DB_DIR, { recursive: true });
  }

  // Initialize test main database
  await initTestMainDb();
});

afterAll(() => {
  // Clean up test databases
  if (fs.existsSync(TEST_MAIN_DB)) {
    fs.unlinkSync(TEST_MAIN_DB);
  }

  // Clean up test tenant databases
  if (fs.existsSync(TEST_TENANT_DB_DIR)) {
    const files = fs.readdirSync(TEST_TENANT_DB_DIR);
    files.forEach((file) => {
      if (file.endsWith(".db")) {
        fs.unlinkSync(path.join(TEST_TENANT_DB_DIR, file));
      }
    });
    fs.rmdirSync(TEST_TENANT_DB_DIR);
  }
});

beforeEach(async () => {
  // Clean up test databases before each test
  if (fs.existsSync(TEST_MAIN_DB)) {
    const sqlite = new Database(TEST_MAIN_DB);
    try {
      sqlite.exec(`
        DELETE FROM organization_invitations;
        DELETE FROM organization_members;
        DELETE FROM organizations;
        DELETE FROM verification_tokens;
        DELETE FROM users;
      `);
    } catch (error) {
      // Ignore errors if tables don't exist
    }
    sqlite.close();
  }

  if (fs.existsSync(TEST_TENANT_DB_DIR)) {
    const files = fs.readdirSync(TEST_TENANT_DB_DIR);
    files.forEach((file) => {
      if (file.endsWith(".db")) {
        fs.unlinkSync(path.join(TEST_TENANT_DB_DIR, file));
      }
    });
  }

  // Reinitialize schemas
  await initTestMainDb();
});

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.NEXTAUTH_SECRET = "test-secret-key-for-testing-only-min-32-chars";
process.env.MASTER_ENCRYPTION_KEY = "test-master-key-for-testing-only-min-32-chars";
process.env.NEXTAUTH_URL = "http://localhost:3000";

// Export helper for tests
export { initTestTenantDb };
