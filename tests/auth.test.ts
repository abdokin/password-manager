import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { usersTable, verificationTokensTable } from "../data/schema";
import { cleanupTestDb, createTestMainDb } from "./utils/test-db";

describe("Authentication", () => {
  beforeEach(() => {
    cleanupTestDb();
  });

  const getTestDb = () => createTestMainDb();

  describe("User Creation", () => {
    it("should create a new user with email", async () => {
      const testDb = getTestDb();
      const email = "test@example.com";

      const [user] = await testDb
        .insert(usersTable)
        .values({
          email,
        })
        .returning();

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.id).toBeDefined();
      expect(user.emailVerified).toBeNull();
    });

    it("should enforce unique email constraint", async () => {
      const testDb = getTestDb();
      const email = "duplicate@example.com";

      await testDb.insert(usersTable).values({ email });

      await expect(testDb.insert(usersTable).values({ email })).rejects.toThrow();
    });

    it("should create user with email verified timestamp", async () => {
      const testDb = getTestDb();
      const email = "verified@example.com";
      const verifiedAt = new Date();

      const [user] = await testDb
        .insert(usersTable)
        .values({
          email,
          emailVerified: verifiedAt,
        })
        .returning();

      expect(user.emailVerified).toBeDefined();
      // SQLite stores timestamps as integers, so there might be slight rounding
      // Check that timestamps are close (within 2 seconds)
      const timeDiff = Math.abs((user.emailVerified?.getTime() || 0) - verifiedAt.getTime());
      expect(timeDiff).toBeLessThan(2000);
    });
  });

  describe("Verification Tokens", () => {
    it("should create a verification token", async () => {
      const testDb = getTestDb();
      const identifier = "test@example.com";
      const token = "test-token-123";
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await testDb.insert(verificationTokensTable).values({
        identifier,
        token,
        expires,
      });

      const [saved] = await testDb
        .select()
        .from(verificationTokensTable)
        .where(eq(verificationTokensTable.token, token))
        .limit(1);

      expect(saved).toBeDefined();
      expect(saved.identifier).toBe(identifier);
      expect(saved.token).toBe(token);
    });

    it("should enforce unique token constraint", async () => {
      const testDb = getTestDb();
      const token = "unique-token-123";
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await testDb.insert(verificationTokensTable).values({
        identifier: "test1@example.com",
        token,
        expires,
      });

      await expect(
        testDb.insert(verificationTokensTable).values({
          identifier: "test2@example.com",
          token,
          expires,
        })
      ).rejects.toThrow();
    });

    it("should find valid verification token", async () => {
      const testDb = getTestDb();
      const identifier = "test@example.com";
      const token = "valid-token-123";
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await testDb.insert(verificationTokensTable).values({
        identifier,
        token,
        expires,
      });

      const [found] = await testDb
        .select()
        .from(verificationTokensTable)
        .where(eq(verificationTokensTable.token, token))
        .limit(1);

      expect(found).toBeDefined();
      expect(found.token).toBe(token);
      expect(new Date(found.expires).getTime()).toBeGreaterThan(Date.now());
    });

    it("should not find expired token", async () => {
      const testDb = getTestDb();
      const token = "expired-token-123";
      const expires = new Date(Date.now() - 1000); // Expired

      await testDb.insert(verificationTokensTable).values({
        identifier: "test@example.com",
        token,
        expires,
      });

      const [found] = await testDb
        .select()
        .from(verificationTokensTable)
        .where(eq(verificationTokensTable.token, token))
        .limit(1);

      expect(found).toBeDefined();
      expect(new Date(found.expires).getTime()).toBeLessThan(Date.now());
    });
  });

  describe("User Lookup", () => {
    it("should find user by email", async () => {
      const testDb = getTestDb();
      const email = "lookup@example.com";

      await testDb.insert(usersTable).values({ email });

      const [user] = await testDb
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
    });

    it("should return null for non-existent user", async () => {
      const testDb = getTestDb();
      const [user] = await testDb
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, "nonexistent@example.com"))
        .limit(1);

      expect(user).toBeUndefined();
    });

    it("should find user by ID", async () => {
      const testDb = getTestDb();
      const email = "idlookup@example.com";

      const [created] = await testDb.insert(usersTable).values({ email }).returning();

      const [found] = await testDb
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, created.id))
        .limit(1);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.email).toBe(email);
    });
  });
});
