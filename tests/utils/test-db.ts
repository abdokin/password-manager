import Database from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import * as fs from "fs";
import * as path from "path";

const TEST_MAIN_DB = path.join(__dirname, "../../test-main.db");
const TEST_TENANT_DB_DIR = path.join(__dirname, "../../test-tenants");

export function createTestMainDb(): BetterSQLite3Database {
  const sqlite = new Database(TEST_MAIN_DB);
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite);
}

export function createTestTenantDb(orgId: number): BetterSQLite3Database {
  if (!fs.existsSync(TEST_TENANT_DB_DIR)) {
    fs.mkdirSync(TEST_TENANT_DB_DIR, { recursive: true });
  }

  const dbPath = path.join(TEST_TENANT_DB_DIR, `tenant-${orgId}.db`);

  // Delete existing database to ensure clean state
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma("foreign_keys = ON");

  // Create tables if they don't exist
  // Note: In tenant DBs, user_id is just an integer reference, not a foreign key
  // because users are in the main database
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

  return drizzle(sqlite);
}

export function cleanupTestDb() {
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
        try {
          fs.unlinkSync(path.join(TEST_TENANT_DB_DIR, file));
        } catch (error) {
          // Ignore errors
        }
      }
    });
  }
}
