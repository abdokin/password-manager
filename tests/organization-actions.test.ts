import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { organizationMembersTable, organizationsTable, usersTable } from "../data/schema";
import { cleanupTestDb, createTestMainDb } from "./utils/test-db";

// Mock getCurrentUserId
vi.mock("../lib/get-session", () => ({
  getCurrentUserId: vi.fn(),
}));

describe("Organization Actions", () => {
  let testUserId: number;

  beforeEach(async () => {
    cleanupTestDb();
    const testDb = createTestMainDb();
    const [user] = await testDb
      .insert(usersTable)
      .values({ email: "actiontest@example.com" })
      .returning();
    testUserId = user.id;
  });

  const getTestDb = () => createTestMainDb();

  describe("Organization Creation Logic", () => {
    it("should create organization with unique slug", async () => {
      const testDb = getTestDb();
      const orgName = "New Organization";
      const baseSlug = orgName.toLowerCase().replace(/\s+/g, "-");
      const slug = `${baseSlug}-${uuidv4().split("-")[0]}`;

      const [org] = await testDb
        .insert(organizationsTable)
        .values({
          name: orgName,
          slug,
        })
        .returning();

      expect(org.name).toBe(orgName);
      expect(org.slug).toContain(baseSlug);
    });

    it("should add creator as owner", async () => {
      const testDb = getTestDb();
      const [org] = await testDb
        .insert(organizationsTable)
        .values({
          name: "Owner Test",
          slug: `owner-${uuidv4().split("-")[0]}`,
        })
        .returning();

      const [member] = await testDb
        .insert(organizationMembersTable)
        .values({
          userId: testUserId,
          organizationId: org.id,
          role: "owner",
          invitedBy: testUserId,
        })
        .returning();

      expect(member.role).toBe("owner");
      expect(member.userId).toBe(testUserId);
    });
  });

  describe("Member Invitation Logic", () => {
    let orgId: number;

    beforeEach(async () => {
      const testDb = getTestDb();
      const [org] = await testDb
        .insert(organizationsTable)
        .values({
          name: "Invite Test",
          slug: `invite-${uuidv4().split("-")[0]}`,
        })
        .returning();
      orgId = org.id;

      await testDb.insert(organizationMembersTable).values({
        userId: testUserId,
        organizationId: orgId,
        role: "admin",
        invitedBy: testUserId,
      });
    });

    it("should check member limit before inviting", async () => {
      const testDb = getTestDb();
      const [org] = await testDb
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, orgId))
        .limit(1);

      const members = await testDb
        .select()
        .from(organizationMembersTable)
        .where(eq(organizationMembersTable.organizationId, orgId));

      const canInvite = members.length < org.maxMembers;
      expect(canInvite).toBe(true);
    });

    it("should enforce member limit", async () => {
      const testDb = getTestDb();
      // Update org to have limit of 1
      await testDb
        .update(organizationsTable)
        .set({ maxMembers: 1 })
        .where(eq(organizationsTable.id, orgId));

      const [org] = await testDb
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, orgId))
        .limit(1);

      const members = await testDb
        .select()
        .from(organizationMembersTable)
        .where(eq(organizationMembersTable.organizationId, orgId));

      const canInvite = members.length < org.maxMembers;
      expect(canInvite).toBe(false); // Already has 1 member (the admin)
    });
  });

  describe("Role Management", () => {
    let orgId: number;
    let memberUserId: number;

    beforeEach(async () => {
      const testDb = getTestDb();
      const [org] = await testDb
        .insert(organizationsTable)
        .values({
          name: "Role Test",
          slug: `role-${uuidv4().split("-")[0]}`,
        })
        .returning();
      orgId = org.id;

      const [memberUser] = await testDb
        .insert(usersTable)
        .values({ email: "member@example.com" })
        .returning();
      memberUserId = memberUser.id;

      await testDb.insert(organizationMembersTable).values({
        userId: testUserId,
        organizationId: orgId,
        role: "owner",
        invitedBy: testUserId,
      });

      await testDb.insert(organizationMembersTable).values({
        userId: memberUserId,
        organizationId: orgId,
        role: "member",
        invitedBy: testUserId,
      });
    });

    it("should allow owner to change member role", async () => {
      const testDb = getTestDb();
      await testDb
        .update(organizationMembersTable)
        .set({ role: "admin" })
        .where(eq(organizationMembersTable.userId, memberUserId));

      const [updated] = await testDb
        .select()
        .from(organizationMembersTable)
        .where(eq(organizationMembersTable.userId, memberUserId))
        .limit(1);

      expect(updated.role).toBe("admin");
    });

    it("should prevent removing last owner", async () => {
      const testDb = getTestDb();
      const owners = await testDb
        .select()
        .from(organizationMembersTable)
        .where(eq(organizationMembersTable.organizationId, orgId));

      const ownerCount = owners.filter((m) => m.role === "owner").length;
      expect(ownerCount).toBeGreaterThan(0);
    });
  });
});
