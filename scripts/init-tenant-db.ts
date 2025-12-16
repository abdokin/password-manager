#!/usr/bin/env node

/**
 * Initialize a tenant database with the tenant schema
 * Usage: pnpm tsx scripts/init-tenant-db.ts <organizationId>
 */
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as path from "path";

import { getTenantDb, initializeTenantDb } from "../data/tenant-db";

const organizationId = process.argv[2];

if (!organizationId) {
  console.error("Usage: pnpm tsx scripts/init-tenant-db.ts <organizationId>");
  process.exit(1);
}

const orgIdNum = parseInt(organizationId);
if (isNaN(orgIdNum)) {
  console.error("Organization ID must be a number");
  process.exit(1);
}

async function main() {
  try {
    console.log(`Initializing tenant database for organization ${orgIdNum}...`);

    await initializeTenantDb(orgIdNum);
    const db = getTenantDb(orgIdNum);

    // Run migrations if they exist
    const migrationsPath = path.join(process.cwd(), "drizzle", "tenant");
    try {
      migrate(db, { migrationsFolder: migrationsPath });
      console.log("✓ Migrations applied");
    } catch (error) {
      console.log("⚠ No migrations found or migration error (this is OK for new setup)");
    }

    console.log(`✓ Tenant database initialized successfully`);
    console.log(`  Database location: data/tenants/tenant-${orgIdNum}.db`);
  } catch (error) {
    console.error("Error initializing tenant database:", error);
    process.exit(1);
  }
}

main();
