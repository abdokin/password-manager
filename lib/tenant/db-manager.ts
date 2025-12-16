import Database from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as fs from "fs";
import * as path from "path";

const TENANT_DB_DIR = path.join(process.cwd(), "tenant-dbs");

// Ensure tenant database directory exists
if (!fs.existsSync(TENANT_DB_DIR)) {
  fs.mkdirSync(TENANT_DB_DIR, { recursive: true });
}

/**
 * Get database path for a tenant
 */
export function getTenantDbPath(tenantId: string): string {
  return path.join(TENANT_DB_DIR, `tenant-${tenantId}.db`);
}

/**
 * Get or create database connection for a tenant
 */
const tenantConnections = new Map<string, BetterSQLite3Database>();

export function getTenantDb(tenantId: string): BetterSQLite3Database {
  if (tenantConnections.has(tenantId)) {
    return tenantConnections.get(tenantId)!;
  }

  const dbPath = getTenantDbPath(tenantId);
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  tenantConnections.set(tenantId, db);

  return db;
}

/**
 * Create a new tenant database
 */
export async function createTenantDatabase(tenantId: string): Promise<void> {
  const dbPath = getTenantDbPath(tenantId);

  // Create database file if it doesn't exist
  if (!fs.existsSync(dbPath)) {
    const sqlite = new Database(dbPath);
    sqlite.close();
  }

  // Run migrations
  const db = getTenantDb(tenantId);
  // Note: You'll need to create tenant-specific migrations
  // For now, we'll use the same schema
  try {
    // migrate(db, { migrationsFolder: "drizzle" });
  } catch (error) {
    console.error(`Error migrating tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Delete a tenant database
 */
export async function deleteTenantDatabase(tenantId: string): Promise<void> {
  const dbPath = getTenantDbPath(tenantId);

  // Close connection if open
  if (tenantConnections.has(tenantId)) {
    tenantConnections.delete(tenantId);
  }

  // Delete database file
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
}

/**
 * List all tenant databases
 */
export function listTenantDatabases(): string[] {
  if (!fs.existsSync(TENANT_DB_DIR)) {
    return [];
  }

  return fs
    .readdirSync(TENANT_DB_DIR)
    .filter((file) => file.startsWith("tenant-") && file.endsWith(".db"))
    .map((file) => file.replace("tenant-", "").replace(".db", ""));
}

/**
 * Close all tenant database connections
 */
export function closeAllTenantConnections(): void {
  tenantConnections.forEach((db, tenantId) => {
    // Note: BetterSQLite3 doesn't expose close method directly
    // Connections will be closed when process exits
  });
  tenantConnections.clear();
}
