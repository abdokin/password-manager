"use server";

import { and, desc, eq } from "drizzle-orm";

import { getServerSession } from "next-auth";

import { getTenantDb } from "@/data/tenant-db";
import { passwordHistoryTable, passwordsTable } from "@/data/tenant-schema";

import { authOptions } from "./auth";
import { decryptPassword, encryptPassword } from "./encryption";
import { getCurrentUserId } from "./get-session";
import { getCurrentOrganizationId } from "./tenant-context";

async function getMasterPassword(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  return process.env.MASTER_ENCRYPTION_KEY || "default-key-change-in-production";
}

export async function getPasswordHistory(passwordId: number) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
        history: [],
      };
    }

    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return {
        error: "No organization selected",
        history: [],
      };
    }

    const db = getTenantDb(organizationId);

    // Verify ownership
    const [password] = await db
      .select()
      .from(passwordsTable)
      .where(and(eq(passwordsTable.id, passwordId), eq(passwordsTable.userId, userId)))
      .limit(1);

    if (!password) {
      return {
        error: "Password not found or access denied",
        history: [],
      };
    }

    const history = await db
      .select()
      .from(passwordHistoryTable)
      .where(eq(passwordHistoryTable.passwordId, passwordId))
      .orderBy(desc(passwordHistoryTable.changedAt));

    const masterPassword = await getMasterPassword();

    // Decrypt history entries
    const decryptedHistory = history.map((entry) => ({
      ...entry,
      oldPassword: decryptPassword(entry.oldPassword, masterPassword),
    }));

    return {
      success: true,
      history: decryptedHistory,
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to fetch password history",
      history: [],
    };
  }
}

export async function restorePasswordFromHistory(passwordId: number, historyId: number) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
      };
    }

    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return {
        error: "No organization selected",
      };
    }

    const db = getTenantDb(organizationId);

    // Verify ownership
    const [password] = await db
      .select()
      .from(passwordsTable)
      .where(and(eq(passwordsTable.id, passwordId), eq(passwordsTable.userId, userId)))
      .limit(1);

    if (!password) {
      return {
        error: "Password not found or access denied",
      };
    }

    // Get history entry
    const [historyEntry] = await db
      .select()
      .from(passwordHistoryTable)
      .where(
        and(eq(passwordHistoryTable.id, historyId), eq(passwordHistoryTable.passwordId, passwordId))
      )
      .limit(1);

    if (!historyEntry) {
      return {
        error: "History entry not found",
      };
    }

    // Save current password to history before restoring
    const masterPassword = await getMasterPassword();
    await db.insert(passwordHistoryTable).values({
      passwordId,
      oldPassword: password.password,
      changedBy: userId,
    });

    // Restore old password
    await db
      .update(passwordsTable)
      .set({
        password: historyEntry.oldPassword,
        updatedAt: new Date(),
      })
      .where(eq(passwordsTable.id, passwordId));

    return {
      success: true,
      message: "Password restored from history",
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to restore password",
    };
  }
}
