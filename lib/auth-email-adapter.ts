import { and, eq, gt, lt } from "drizzle-orm";

import type { Adapter } from "next-auth/adapters";

import { db } from "@/data";
import { usersTable, verificationTokensTable } from "@/data/schema";

import { queueMagicLinkEmail } from "./email-service";

export function EmailAdapter(): Adapter {
  return {
    async createUser(user) {
      const [newUser] = await db
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

    async getUser(id) {
      const [user] = await db
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

    async getUserByEmail(email) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

      if (!user) return null;

      return {
        id: user.id.toString(),
        email: user.email,
        emailVerified: user.emailVerified,
      };
    },

    async getUserByAccount({ providerAccountId, providerId }) {
      // Not used for email provider
      return null;
    },

    async updateUser(user) {
      if (!user.id) throw new Error("User ID is required");

      const updateData: any = {};
      if (user.email) updateData.email = user.email;
      if (user.emailVerified) updateData.emailVerified = new Date(user.emailVerified);

      const [updated] = await db
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

    async linkAccount(account) {
      // Not used for email provider
      return account;
    },

    async createSession({ sessionToken, userId, expires }) {
      // Sessions are handled by JWT in NextAuth v5
      return {
        sessionToken,
        userId,
        expires,
      };
    },

    async getSessionAndUser(sessionToken) {
      // Sessions are handled by JWT in NextAuth v5
      return null;
    },

    async updateSession({ sessionToken }) {
      // Sessions are handled by JWT in NextAuth v5
      return null;
    },

    async deleteSession(sessionToken) {
      // Sessions are handled by JWT in NextAuth v5
    },

    async createVerificationToken({ identifier, token, expires }) {
      // Clean up expired tokens first
      await db
        .delete(verificationTokensTable)
        .where(lt(verificationTokensTable.expires, new Date()));

      await db.insert(verificationTokensTable).values({
        identifier,
        token,
        expires: new Date(expires),
      });

      // Queue email to be sent in background
      await queueMagicLinkEmail(identifier, token);

      return {
        identifier,
        token,
        expires: new Date(expires),
      };
    },

    async useVerificationToken({ identifier, token }) {
      const [verificationToken] = await db
        .select()
        .from(verificationTokensTable)
        .where(
          and(
            eq(verificationTokensTable.identifier, identifier),
            eq(verificationTokensTable.token, token),
            gt(verificationTokensTable.expires, new Date())
          )
        )
        .limit(1);

      if (!verificationToken) return null;

      // Delete the token after use
      await db
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
