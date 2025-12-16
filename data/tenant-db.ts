import Database from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import * as fs from "fs";
import * as path from "path";

// Cache for tenant database connections
const tenantDbCache = new Map<number, BetterSQLite3Database>();

/**
 * Get the database path for a specific organization/tenant
 */
function getTenantDbPath(organizationId: number): string {
  const dbDir = path.join(process.cwd(), "data", "tenants");

  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return path.join(dbDir, `tenant-${organizationId}.db`);
}

/**
 * Get or create a tenant-specific database connection
 */
export function getTenantDb(organizationId: number): BetterSQLite3Database {
  // Check cache first
  if (tenantDbCache.has(organizationId)) {
    return tenantDbCache.get(organizationId)!;
  }

  // Create new database connection
  const dbPath = getTenantDbPath(organizationId);
  const sqlite = new Database(dbPath);

  // Enable foreign keys
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite);

  // Cache the connection
  tenantDbCache.set(organizationId, db);

  return db;
}

/**
 * Initialize tenant database schema
 * This should be called when a new organization is created
 */
export async function initializeTenantDb(organizationId: number) {
  const dbPath = getTenantDbPath(organizationId);
  const sqlite = new Database(dbPath);
  sqlite.pragma("foreign_keys = ON");

  // Create tables if they don't exist
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

  // Get and return the drizzle connection
  return getTenantDb(organizationId);
}

/**
 * Close all tenant database connections
 */
export function closeTenantDbs() {
  tenantDbCache.forEach((db, orgId) => {
    // Note: better-sqlite3 doesn't have a close method in the drizzle wrapper
    // The connections will be closed when the process exits
  });
  tenantDbCache.clear();
}

/**
 * Delete a tenant database (for cleanup/testing)
 */
export function deleteTenantDb(organizationId: number): boolean {
  try {
    const dbPath = getTenantDbPath(organizationId);
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      tenantDbCache.delete(organizationId);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting tenant DB for org ${organizationId}:`, error);
    return false;
  }
}
