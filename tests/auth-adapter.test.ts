import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usersTable, verificationTokensTable } from "../data/schema";
import { cleanupTestDb, createTestMainDb } from "./utils/test-db";

// Mock the database module to use test database
vi.mock("../data", async () => {
  const actual = await vi.importActual("../data");
  return {
    ...actual,
    db: null, // Will be set in beforeEach
  };
});

// Mock email service
vi.mock("../lib/email-service", () => ({
  queueMagicLinkEmail: vi.fn().mockResolvedValue({ success: true }),
}));

// Create a test adapter that uses test database
function createTestAdapter(testDb: ReturnType<typeof createTestMainDb>) {
  return {
    async createUser(user: { email: string; emailVerified?: Date | null }) {
      const [newUser] = await testDb
        .insert(usersTable)
        .values({
          email: user.email!,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        })
        .returning();

      return {
        id: newUser.id.toString(),
        email: newUser.email,
        emailVerified: newUser.emailVerified,
      };
    },

    async getUser(id: string) {
      const [user] = await testDb
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, parseInt(id)))
        .limit(1);

      if (!user) return null;

      return {
        id: user.id.toString(),
        email: user.email,
        emailVerified: user.emailVerified,
      };
    },

    async getUserByEmail(email: string) {
      const [user] = await testDb
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (!user) return null;

      return {
        id: user.id.toString(),
        email: user.email,
        emailVerified: user.emailVerified,
      };
    },

    async updateUser(user: { id: string; email?: string; emailVerified?: Date | null }) {
      if (!user.id) throw new Error("User ID is required");

      const updateData: any = {};
      if (user.email) updateData.email = user.email;
      if (user.emailVerified) updateData.emailVerified = new Date(user.emailVerified);

      const [updated] = await testDb
        .update(usersTable)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, parseInt(user.id)))
        .returning();

      return {
        id: updated.id.toString(),
        email: updated.email,
        emailVerified: updated.emailVerified,
      };
    },

    async createVerificationToken({
      identifier,
      token,
      expires,
    }: {
      identifier: string;
      token: string;
      expires: Date;
    }) {
      await testDb.insert(verificationTokensTable).values({
        identifier,
        token,
        expires: new Date(expires),
      });

      return {
        identifier,
        token,
        expires: new Date(expires),
      };
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const [verificationToken] = await testDb
        .select()
        .from(verificationTokensTable)
        .where(eq(verificationTokensTable.token, token))
        .limit(1);

      if (!verificationToken) return null;

      // Check if expired
      if (new Date(verificationToken.expires).getTime() <= Date.now()) {
        return null;
      }

      // Delete the token after use
      await testDb
        .delete(verificationTokensTable)
        .where(eq(verificationTokensTable.id, verificationToken.id));

      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      };
    },
  };
}

describe("Email Adapter", () => {
  let testDb: ReturnType<typeof createTestMainDb>;
  let adapter: ReturnType<typeof createTestAdapter>;

  beforeEach(() => {
    cleanupTestDb();
    testDb = createTestMainDb();
    adapter = createTestAdapter(testDb);
  });

  describe("User Management", () => {
    it("should create a new user", async () => {
      const email = "adapter@example.com";

      const user = await adapter.createUser({
        email,
        emailVerified: null,
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.id).toBeDefined();

      // Verify in database
      const [dbUser] = await testDb
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(email);
    });

    it("should get user by ID", async () => {
      const [created] = await testDb
        .insert(usersTable)
        .values({ email: "getbyid@example.com" })
        .returning();

      const user = await adapter.getUser(created.id.toString());

      expect(user).toBeDefined();
      expect(user?.id).toBe(created.id.toString());
      expect(user?.email).toBe("getbyid@example.com");
    });

    it("should get user by email", async () => {
      const email = "getbyemail@example.com";
      await testDb.insert(usersTable).values({ email });

      const user = await adapter.getUserByEmail(email);

      expect(user).toBeDefined();
      expect(user?.email).toBe(email);
    });

    it("should return null for non-existent user", async () => {
      const user = await adapter.getUserByEmail("nonexistent@example.com");
      expect(user).toBeNull();
    });

    it("should update user", async () => {
      const [created] = await testDb
        .insert(usersTable)
        .values({ email: "update@example.com" })
        .returning();

      const verifiedAt = new Date();
      const updated = await adapter.updateUser({
        id: created.id.toString(),
        emailVerified: verifiedAt,
      });

      expect(updated.emailVerified).toBeDefined();
    });
  });

  describe("Verification Tokens", () => {
    it("should create verification token", async () => {
      const identifier = "verify@example.com";
      const token = "test-verification-token";
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = await adapter.createVerificationToken({
        identifier,
        token,
        expires,
      });

      expect(result).toBeDefined();
      expect(result.identifier).toBe(identifier);
      expect(result.token).toBe(token);

      // Verify in database
      const [dbToken] = await testDb
        .select()
        .from(verificationTokensTable)
        .where(eq(verificationTokensTable.token, token))
        .limit(1);

      expect(dbToken).toBeDefined();
    });

    it("should use verification token", async () => {
      const identifier = "use@example.com";
      const token = "use-token-123";
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await testDb.insert(verificationTokensTable).values({
        identifier,
        token,
        expires,
      });

      const result = await adapter.useVerificationToken({
        identifier,
        token,
      });

      expect(result).toBeDefined();
      expect(result?.token).toBe(token);

      // Token should be deleted after use
      const [deleted] = await testDb
        .select()
        .from(verificationTokensTable)
        .where(eq(verificationTokensTable.token, token))
        .limit(1);

      expect(deleted).toBeUndefined();
    });

    it("should return null for expired token", async () => {
      const identifier = "expired@example.com";
      const token = "expired-token";
      const expires = new Date(Date.now() - 1000); // Expired

      await testDb.insert(verificationTokensTable).values({
        identifier,
        token,
        expires,
      });

      const result = await adapter.useVerificationToken({
        identifier,
        token,
      });

      expect(result).toBeNull();
    });

    it("should return null for invalid token", async () => {
      const result = await adapter.useVerificationToken({
        identifier: "test@example.com",
        token: "invalid-token",
      });

      expect(result).toBeNull();
    });
  });
});
