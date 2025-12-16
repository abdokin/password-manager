import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { beforeEach, describe, expect, it } from "vitest";

import { deleteTenantDb, getTenantDb, initializeTenantDb } from "../data/tenant-db";
import { passwordsTable } from "../data/tenant-schema";
import { encryptPassword } from "../lib/encryption";

const testMasterPassword =
  process.env.MASTER_ENCRYPTION_KEY || "test-master-key-for-testing-only-min-32-chars";

describe("Tenant Database", () => {
  const testOrgId = 999;

  beforeEach(() => {
    // Clean up test tenant database
    deleteTenantDb(testOrgId);
  });

  describe("Tenant DB Creation", () => {
    it("should create a tenant database", async () => {
      await initializeTenantDb(testOrgId);
      const db = getTenantDb(testOrgId);

      expect(db).toBeDefined();

      // Verify database file exists
      const dbPath = path.join(process.cwd(), "data", "tenants", `tenant-${testOrgId}.db`);
      expect(fs.existsSync(dbPath)).toBe(true);
    });

    it("should create separate databases for different organizations", async () => {
      const orgId1 = 1001;
      const orgId2 = 1002;

      await initializeTenantDb(orgId1);
      await initializeTenantDb(orgId2);

      const db1 = getTenantDb(orgId1);
      const db2 = getTenantDb(orgId2);

      expect(db1).toBeDefined();
      expect(db2).toBeDefined();
      expect(db1).not.toBe(db2);

      // Cleanup
      deleteTenantDb(orgId1);
      deleteTenantDb(orgId2);
    });
  });

  describe("Tenant DB Operations", () => {
    beforeEach(async () => {
      await initializeTenantDb(testOrgId);
    });

    it("should store passwords in tenant database", async () => {
      await initializeTenantDb(testOrgId);
      const db = getTenantDb(testOrgId);
      const userId = 1;

      const [password] = await db
        .insert(passwordsTable)
        .values({
          userId,
          name: "Tenant Test Site",
          slug: uuidv4(),
          username: "tenantuser",
          password: encryptPassword("tenantpass", testMasterPassword),
        })
        .returning();

      expect(password).toBeDefined();
      expect(password.name).toBe("Tenant Test Site");

      const [retrieved] = await db
        .select()
        .from(passwordsTable)
        .where(eq(passwordsTable.id, password.id))
        .limit(1);

      expect(retrieved).toBeDefined();
      expect(retrieved.name).toBe("Tenant Test Site");
    });

    it("should isolate data between tenant databases", async () => {
      const orgId1 = 2001;
      const orgId2 = 2002;

      await initializeTenantDb(orgId1);
      await initializeTenantDb(orgId2);

      const db1 = getTenantDb(orgId1);
      const db2 = getTenantDb(orgId2);

      // Insert password in org1
      const [pwd1] = await db1
        .insert(passwordsTable)
        .values({
          userId: 1,
          name: "Org1 Site",
          slug: uuidv4(),
          username: "org1user",
          password: encryptPassword("org1pass", testMasterPassword),
        })
        .returning();

      // Insert password in org2
      const [pwd2] = await db2
        .insert(passwordsTable)
        .values({
          userId: 1,
          name: "Org2 Site",
          slug: uuidv4(),
          username: "org2user",
          password: encryptPassword("org2pass", testMasterPassword),
        })
        .returning();

      // Verify isolation
      const org1Passwords = await db1.select().from(passwordsTable);
      const org2Passwords = await db2.select().from(passwordsTable);

      expect(org1Passwords.length).toBe(1);
      expect(org2Passwords.length).toBe(1);
      expect(org1Passwords[0].name).toBe("Org1 Site");
      expect(org2Passwords[0].name).toBe("Org2 Site");

      // Cleanup
      deleteTenantDb(orgId1);
      deleteTenantDb(orgId2);
    });
  });

  describe("Tenant DB Cleanup", () => {
    it("should delete tenant database", async () => {
      await initializeTenantDb(testOrgId);

      const dbPath = path.join(process.cwd(), "data", "tenants", `tenant-${testOrgId}.db`);
      expect(fs.existsSync(dbPath)).toBe(true);

      const deleted = deleteTenantDb(testOrgId);
      expect(deleted).toBe(true);
      expect(fs.existsSync(dbPath)).toBe(false);
    });

    it("should handle deletion of non-existent database", () => {
      const deleted = deleteTenantDb(99999);
      expect(deleted).toBe(false);
    });
  });
});
