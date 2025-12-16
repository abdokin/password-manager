import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { beforeEach, describe, expect, it } from "vitest";

import { organizationMembersTable, organizationsTable, usersTable } from "../data/schema";
import { cleanupTestDb, createTestMainDb } from "./utils/test-db";

describe("Organization Management", () => {
  let testUserId: number;

  beforeEach(async () => {
    cleanupTestDb();
    const testDb = createTestMainDb();

    // Create a test user
    const [user] = await testDb
      .insert(usersTable)
      .values({ email: "orgtest@example.com" })
      .returning();
    testUserId = user.id;
  });

  const getTestDb = () => createTestMainDb();

  describe("Organization Creation", () => {
    it("should create a new organization", async () => {
      const testDb = getTestDb();
      const orgName = "Test Organization";
      const slug = `test-org-${uuidv4().split("-")[0]}`;

      const [org] = await testDb
        .insert(organizationsTable)
        .values({
          name: orgName,
          slug,
        })
        .returning();

      expect(org).toBeDefined();
      expect(org.name).toBe(orgName);
      expect(org.slug).toBe(slug);
      expect(org.plan).toBe("free");
      expect(org.maxMembers).toBe(5);
      expect(org.maxPasswords).toBe(100);
    });

    it("should enforce unique slug constraint", async () => {
      const testDb = getTestDb();
      const slug = "unique-slug-123";

      await testDb.insert(organizationsTable).values({
        name: "Org 1",
        slug,
      });

      await expect(
        testDb.insert(organizationsTable).values({
          name: "Org 2",
          slug,
        })
      ).rejects.toThrow();
    });
  });

  describe("Organization Members", () => {
    let orgId: number;

    beforeEach(async () => {
      cleanupTestDb();
      const testDb = getTestDb();

      // Recreate user if needed
      const [existingUser] = await testDb
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, "orgtest@example.com"))
        .limit(1);

      if (!existingUser) {
        const [user] = await testDb
          .insert(usersTable)
          .values({ email: "orgtest@example.com" })
          .returning();
        testUserId = user.id;
      } else {
        testUserId = existingUser.id;
      }

      const [org] = await testDb
        .insert(organizationsTable)
        .values({
          name: "Test Org",
          slug: `test-${uuidv4().split("-")[0]}`,
        })
        .returning();
      orgId = org.id;
    });

    it("should add a user as organization member", async () => {
      const testDb = getTestDb();
      const [member] = await testDb
        .insert(organizationMembersTable)
        .values({
          userId: testUserId,
          organizationId: orgId,
          role: "owner",
          invitedBy: testUserId,
        })
        .returning();

      expect(member).toBeDefined();
      expect(member.userId).toBe(testUserId);
      expect(member.organizationId).toBe(orgId);
      expect(member.role).toBe("owner");
    });

    it("should find all members of an organization", async () => {
      const testDb = getTestDb();
      // Add multiple members
      const [user2] = await testDb
        .insert(usersTable)
        .values({ email: "member2@example.com" })
        .returning();

      await testDb.insert(organizationMembersTable).values({
        userId: testUserId,
        organizationId: orgId,
        role: "owner",
        invitedBy: testUserId,
      });

      await testDb.insert(organizationMembersTable).values({
        userId: user2.id,
        organizationId: orgId,
        role: "member",
        invitedBy: testUserId,
      });

      const members = await testDb
        .select()
        .from(organizationMembersTable)
        .where(eq(organizationMembersTable.organizationId, orgId));

      expect(members.length).toBe(2);
      expect(members.some((m) => m.role === "owner")).toBe(true);
      expect(members.some((m) => m.role === "member")).toBe(true);
    });

    it("should update member role", async () => {
      const testDb = getTestDb();
      await testDb.insert(organizationMembersTable).values({
        userId: testUserId,
        organizationId: orgId,
        role: "member",
        invitedBy: testUserId,
      });

      await testDb
        .update(organizationMembersTable)
        .set({ role: "admin" })
        .where(
          and(
            eq(organizationMembersTable.userId, testUserId),
            eq(organizationMembersTable.organizationId, orgId)
          )
        );

      const [updated] = await testDb
        .select()
        .from(organizationMembersTable)
        .where(
          and(
            eq(organizationMembersTable.userId, testUserId),
            eq(organizationMembersTable.organizationId, orgId)
          )
        )
        .limit(1);

      expect(updated.role).toBe("admin");
    });

    it("should remove a member from organization", async () => {
      const testDb = getTestDb();
      await testDb.insert(organizationMembersTable).values({
        userId: testUserId,
        organizationId: orgId,
        role: "member",
        invitedBy: testUserId,
      });

      await testDb
        .delete(organizationMembersTable)
        .where(
          and(
            eq(organizationMembersTable.userId, testUserId),
            eq(organizationMembersTable.organizationId, orgId)
          )
        );

      const members = await testDb
        .select()
        .from(organizationMembersTable)
        .where(eq(organizationMembersTable.organizationId, orgId));

      expect(members.length).toBe(0);
    });
  });

  describe("Organization Plans", () => {
    it("should create organization with free plan by default", async () => {
      const testDb = getTestDb();
      const [org] = await testDb
        .insert(organizationsTable)
        .values({
          name: "Free Org",
          slug: `free-${uuidv4().split("-")[0]}`,
        })
        .returning();

      expect(org.plan).toBe("free");
      expect(org.maxMembers).toBe(5);
      expect(org.maxPasswords).toBe(100);
    });

    it("should create organization with pro plan", async () => {
      const testDb = getTestDb();
      const [org] = await testDb
        .insert(organizationsTable)
        .values({
          name: "Pro Org",
          slug: `pro-${uuidv4().split("-")[0]}`,
          plan: "pro",
          maxMembers: 25,
          maxPasswords: 1000,
        })
        .returning();

      expect(org.plan).toBe("pro");
      expect(org.maxMembers).toBe(25);
      expect(org.maxPasswords).toBe(1000);
    });

    it("should update organization plan", async () => {
      const testDb = getTestDb();
      const [org] = await testDb
        .insert(organizationsTable)
        .values({
          name: "Upgrade Org",
          slug: `upgrade-${uuidv4().split("-")[0]}`,
        })
        .returning();

      await testDb
        .update(organizationsTable)
        .set({
          plan: "pro",
          maxMembers: 25,
          maxPasswords: 1000,
        })
        .where(eq(organizationsTable.id, org.id));

      const [updated] = await testDb
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, org.id))
        .limit(1);

      expect(updated.plan).toBe("pro");
      expect(updated.maxMembers).toBe(25);
    });
  });
});
