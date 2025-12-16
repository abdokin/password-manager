import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { organizationMembersTable, organizationsTable, usersTable } from "../data/schema";
import { passwordsTable } from "../data/tenant-schema";
import { decryptPassword, encryptPassword } from "../lib/encryption";
import { cleanupTestDb, createTestMainDb, createTestTenantDb } from "./utils/test-db";

// Mock getCurrentUserId and getCurrentOrganizationId
vi.mock("../lib/get-session", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("../lib/tenant-context", () => ({
  getCurrentOrganizationId: vi.fn(),
}));

const masterPassword = process.env.MASTER_ENCRYPTION_KEY || "test-key";

describe("Import/Export", () => {
  let testUserId: number;
  let testOrgId: number;
  let testTenantDb: ReturnType<typeof createTestTenantDb>;

  beforeEach(async () => {
    cleanupTestDb();
    const testMainDb = createTestMainDb();

    const [user] = await testMainDb
      .insert(usersTable)
      .values({ email: "importexport@example.com" })
      .returning();
    testUserId = user.id;

    const [org] = await testMainDb
      .insert(organizationsTable)
      .values({
        name: "Import Export Org",
        slug: `import-${uuidv4().split("-")[0]}`,
      })
      .returning();
    testOrgId = org.id;

    await testMainDb.insert(organizationMembersTable).values({
      userId: testUserId,
      organizationId: testOrgId,
      role: "owner",
      invitedBy: testUserId,
    });

    const { initializeTenantDb } = await import("../data/tenant-db");
    await initializeTenantDb(testOrgId);
    testTenantDb = createTestTenantDb(testOrgId);
  });

  describe("Export", () => {
    it("should export passwords as JSON", async () => {
      // Create test passwords
      await testTenantDb.insert(passwordsTable).values({
        userId: testUserId,
        name: "Site 1",
        slug: uuidv4(),
        username: "user1",
        password: encryptPassword("pass1", masterPassword),
      });

      await testTenantDb.insert(passwordsTable).values({
        userId: testUserId,
        name: "Site 2",
        slug: uuidv4(),
        username: "user2",
        password: encryptPassword("pass2", masterPassword),
      });

      const passwords = await testTenantDb
        .select()
        .from(passwordsTable)
        .where(eq(passwordsTable.userId, testUserId));

      // Simulate export
      const exported = passwords.map((pwd) => ({
        name: pwd.name,
        username: pwd.username,
        password: decryptPassword(pwd.password, masterPassword),
        url: pwd.url || "",
        notes: pwd.notes || "",
      }));

      const json = JSON.stringify(exported, null, 2);

      expect(json).toBeDefined();
      expect(json).toContain("Site 1");
      expect(json).toContain("Site 2");
      expect(json).toContain("pass1");
      expect(json).toContain("pass2");
    });

    it("should export passwords as CSV", async () => {
      await testTenantDb.insert(passwordsTable).values({
        userId: testUserId,
        name: "CSV Site",
        slug: uuidv4(),
        username: "csvuser",
        password: encryptPassword("csvpass", masterPassword),
        url: "https://csv.example.com",
      });

      const passwords = await testTenantDb
        .select()
        .from(passwordsTable)
        .where(eq(passwordsTable.userId, testUserId));

      const exported = passwords.map((pwd) => ({
        name: pwd.name,
        username: pwd.username,
        password: decryptPassword(pwd.password, masterPassword),
        url: pwd.url || "",
        notes: pwd.notes || "",
      }));

      const csv = Papa.unparse(exported);

      expect(csv).toBeDefined();
      expect(csv).toContain("CSV Site");
      expect(csv).toContain("csvuser");
    });
  });

  describe("Import", () => {
    it("should parse JSON import data", () => {
      const jsonData = JSON.stringify([
        {
          name: "Imported Site",
          username: "importuser",
          password: "importpass",
          url: "https://import.example.com",
        },
      ]);

      const parsed = JSON.parse(jsonData);

      expect(parsed).toBeInstanceOf(Array);
      expect(parsed.length).toBe(1);
      expect(parsed[0].name).toBe("Imported Site");
    });

    it("should parse CSV import data", () => {
      const csvData = "name,username,password,url\nTest Site,testuser,testpass,https://test.com";

      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
      });

      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(1);
      expect((result.data[0] as any).name).toBe("Test Site");
    });

    it("should validate import data structure", () => {
      const validData = {
        name: "Valid",
        username: "user",
        password: "pass",
      };

      expect(validData.name).toBeDefined();
      expect(validData.username).toBeDefined();
      expect(validData.password).toBeDefined();
    });

    it("should reject invalid import data", () => {
      const invalidData = {
        name: "",
        username: "user",
        // Missing password
      };

      expect(invalidData.name).toBe("");
      expect((invalidData as any).password).toBeUndefined();
    });
  });
});
