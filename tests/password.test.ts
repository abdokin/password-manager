import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { beforeEach, describe, expect, it } from "vitest";

import { organizationMembersTable, organizationsTable, usersTable } from "../data/schema";
import { categoriesTable, passwordsTable } from "../data/tenant-schema";
import { decryptPassword, encryptPassword } from "../lib/encryption";
import { cleanupTestDb, createTestMainDb, createTestTenantDb } from "./utils/test-db";

const testMainDb = createTestMainDb();
const masterPassword = process.env.MASTER_ENCRYPTION_KEY || "test-key";

describe("Password Management", () => {
  let testUserId: number;
  let testOrgId: number;
  let testTenantDb: ReturnType<typeof createTestTenantDb>;

  beforeEach(async () => {
    cleanupTestDb();

    const testMainDb = createTestMainDb();

    // Create test user
    const [user] = await testMainDb
      .insert(usersTable)
      .values({ email: "passwordtest@example.com" })
      .returning();
    testUserId = user.id;

    // Create test organization
    const [org] = await testMainDb
      .insert(organizationsTable)
      .values({
        name: "Password Test Org",
        slug: `pwd-test-${uuidv4().split("-")[0]}`,
      })
      .returning();
    testOrgId = org.id;

    // Add user as member
    await testMainDb.insert(organizationMembersTable).values({
      userId: testUserId,
      organizationId: testOrgId,
      role: "owner",
      invitedBy: testUserId,
    });

    // Create tenant database with schema
    const { initializeTenantDb } = await import("../data/tenant-db");
    await initializeTenantDb(testOrgId);
    testTenantDb = createTestTenantDb(testOrgId);
  });

  describe("Password Creation", () => {
    it("should create a password entry", async () => {
      const passwordData = {
        userId: testUserId,
        name: "Test Site",
        slug: uuidv4(),
        username: "testuser",
        password: encryptPassword("TestPassword123!", masterPassword),
        url: "https://example.com",
        notes: "Test notes",
      };

      const [password] = await testTenantDb.insert(passwordsTable).values(passwordData).returning();

      expect(password).toBeDefined();
      expect(password.name).toBe("Test Site");
      expect(password.username).toBe("testuser");
      expect(password.password).not.toBe("TestPassword123!"); // Should be encrypted

      // Verify decryption
      const decrypted = decryptPassword(password.password, masterPassword);
      expect(decrypted).toBe("TestPassword123!");
    });

    it("should enforce unique slug constraint", async () => {
      const slug = uuidv4();

      await testTenantDb.insert(passwordsTable).values({
        userId: testUserId,
        name: "Site 1",
        slug,
        username: "user1",
        password: encryptPassword("pass1", masterPassword),
      });

      await expect(
        testTenantDb.insert(passwordsTable).values({
          userId: testUserId,
          name: "Site 2",
          slug,
          username: "user2",
          password: encryptPassword("pass2", masterPassword),
        })
      ).rejects.toThrow();
    });

    it("should create password with optional fields", async () => {
      const [password] = await testTenantDb
        .insert(passwordsTable)
        .values({
          userId: testUserId,
          name: "Minimal Site",
          slug: uuidv4(),
          username: "user",
          password: encryptPassword("password", masterPassword),
          url: null,
          notes: null,
          categoryId: null,
        })
        .returning();

      expect(password.url).toBeNull();
      expect(password.notes).toBeNull();
      expect(password.categoryId).toBeNull();
    });
  });

  describe("Password Retrieval", () => {
    it("should retrieve all passwords for a user", async () => {
      // Create multiple passwords
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

      expect(passwords.length).toBe(2);
    });

    it("should retrieve password by slug", async () => {
      const slug = uuidv4();
      const passwordData = {
        userId: testUserId,
        name: "Findable Site",
        slug,
        username: "finduser",
        password: encryptPassword("findpass", masterPassword),
      };

      await testTenantDb.insert(passwordsTable).values(passwordData);

      const [found] = await testTenantDb
        .select()
        .from(passwordsTable)
        .where(eq(passwordsTable.slug, slug))
        .limit(1);

      expect(found).toBeDefined();
      expect(found.name).toBe("Findable Site");
    });
  });

  describe("Password Update", () => {
    it("should update password details", async () => {
      const slug = uuidv4();
      const [password] = await testTenantDb
        .insert(passwordsTable)
        .values({
          userId: testUserId,
          name: "Original Name",
          slug,
          username: "originaluser",
          password: encryptPassword("originalpass", masterPassword),
        })
        .returning();

      await testTenantDb
        .update(passwordsTable)
        .set({
          name: "Updated Name",
          username: "updateduser",
        })
        .where(eq(passwordsTable.id, password.id));

      const [updated] = await testTenantDb
        .select()
        .from(passwordsTable)
        .where(eq(passwordsTable.id, password.id))
        .limit(1);

      expect(updated.name).toBe("Updated Name");
      expect(updated.username).toBe("updateduser");
    });

    it("should update password value", async () => {
      const slug = uuidv4();
      const [password] = await testTenantDb
        .insert(passwordsTable)
        .values({
          userId: testUserId,
          name: "Update Test",
          slug,
          username: "user",
          password: encryptPassword("oldpass", masterPassword),
        })
        .returning();

      const newEncrypted = encryptPassword("newpass", masterPassword);
      await testTenantDb
        .update(passwordsTable)
        .set({ password: newEncrypted })
        .where(eq(passwordsTable.id, password.id));

      const [updated] = await testTenantDb
        .select()
        .from(passwordsTable)
        .where(eq(passwordsTable.id, password.id))
        .limit(1);

      const decrypted = decryptPassword(updated.password, masterPassword);
      expect(decrypted).toBe("newpass");
    });
  });

  describe("Password Deletion", () => {
    it("should delete a password", async () => {
      const slug = uuidv4();
      const [password] = await testTenantDb
        .insert(passwordsTable)
        .values({
          userId: testUserId,
          name: "To Delete",
          slug,
          username: "deleteuser",
          password: encryptPassword("deletepass", masterPassword),
        })
        .returning();

      await testTenantDb.delete(passwordsTable).where(eq(passwordsTable.id, password.id));

      const [deleted] = await testTenantDb
        .select()
        .from(passwordsTable)
        .where(eq(passwordsTable.id, password.id))
        .limit(1);

      expect(deleted).toBeUndefined();
    });
  });

  describe("Password Categories", () => {
    it("should associate password with category", async () => {
      const [category] = await testTenantDb
        .insert(categoriesTable)
        .values({
          userId: testUserId,
          name: "Work",
          color: "#ff0000",
        })
        .returning();

      const [password] = await testTenantDb
        .insert(passwordsTable)
        .values({
          userId: testUserId,
          name: "Work Site",
          slug: uuidv4(),
          username: "workuser",
          password: encryptPassword("workpass", masterPassword),
          categoryId: category.id,
        })
        .returning();

      expect(password.categoryId).toBe(category.id);
    });
  });
});
