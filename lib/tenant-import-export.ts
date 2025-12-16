"use server";

import { and, eq } from "drizzle-orm";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { getServerSession } from "next-auth";

import { getTenantDb } from "@/data/tenant-db";
import { passwordsTable } from "@/data/tenant-schema";

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

const passwordImportSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  url: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export async function exportPasswords(format: "csv" | "json" = "json") {
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

    const passwords = await db
      .select()
      .from(passwordsTable)
      .where(eq(passwordsTable.userId, userId));

    const masterPassword = await getMasterPassword();

    // Decrypt passwords for export
    const decryptedPasswords = passwords.map((pwd) => {
      try {
        return {
          name: pwd.name,
          username: pwd.username,
          password: decryptPassword(pwd.password, masterPassword),
          url: pwd.url || "",
          notes: pwd.notes || "",
        };
      } catch (error) {
        return {
          name: pwd.name,
          username: pwd.username,
          password: "[DECRYPTION_ERROR]",
          url: pwd.url || "",
          notes: pwd.notes || "",
        };
      }
    });

    if (format === "csv") {
      const csv = Papa.unparse(decryptedPasswords);
      return {
        success: true,
        data: csv,
        filename: `passwords-${new Date().toISOString().split("T")[0]}.csv`,
        contentType: "text/csv",
      };
    } else {
      return {
        success: true,
        data: JSON.stringify(decryptedPasswords, null, 2),
        filename: `passwords-${new Date().toISOString().split("T")[0]}.json`,
        contentType: "application/json",
      };
    }
  } catch (error: any) {
    return {
      error: error.message || "Failed to export passwords",
    };
  }
}

export async function importPasswords(data: string, format: "csv" | "json" = "json") {
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

    let parsedData: any[];

    if (format === "csv") {
      const result = Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
      });
      parsedData = result.data as any[];
    } else {
      parsedData = JSON.parse(data);
    }

    // Validate and import
    const masterPassword = await getMasterPassword();
    const imported: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      try {
        const validated = passwordImportSchema.parse({
          name: row.name || row.Name || row.site || row.Site,
          username: row.username || row.Username || row.email || row.Email,
          password: row.password || row.Password,
          url: row.url || row.URL || row.website || "",
          category: row.category || row.Category || "",
          notes: row.notes || row.Notes || "",
        });

        // Check for duplicates
        const [existing] = await db
          .select()
          .from(passwordsTable)
          .where(
            and(
              eq(passwordsTable.userId, userId),
              eq(passwordsTable.name, validated.name),
              eq(passwordsTable.username, validated.username)
            )
          )
          .limit(1);

        if (existing) {
          errors.push(`Row ${i + 1}: Password for ${validated.name} already exists`);
          continue;
        }

        // Encrypt and insert
        const encryptedPassword = encryptPassword(validated.password, masterPassword);

        const [newPassword] = await db
          .insert(passwordsTable)
          .values({
            userId,
            name: validated.name,
            username: validated.username,
            password: encryptedPassword,
            slug: uuidv4(),
            url: validated.url || null,
            notes: validated.notes || null,
          })
          .returning();

        imported.push(newPassword);
      } catch (error: any) {
        errors.push(`Row ${i + 1}: ${error.message || "Invalid data"}`);
      }
    }

    return {
      success: true,
      imported: imported.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to import passwords",
    };
  }
}
