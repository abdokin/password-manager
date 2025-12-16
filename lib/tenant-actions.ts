"use server";

import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getTenantDb } from "@/data/tenant-db";
import { categoriesTable, passwordHistoryTable, passwordsTable } from "@/data/tenant-schema";

import { authOptions } from "./auth";
import { decryptPassword, encryptPassword } from "./encryption";
import { getCurrentUserId } from "./get-session";
import { getCurrentOrganizationId } from "./tenant-context";

// Get master password from session
async function getMasterPassword(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  return process.env.MASTER_ENCRYPTION_KEY || "default-key-change-in-production";
}

// Get tenant database for current organization
async function getTenantDatabase() {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    throw new Error("No organization selected");
  }
  return getTenantDb(organizationId);
}

const insertPasswordSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  url: z.string().url().optional().or(z.literal("")),
  categoryId: z.number().optional().nullable(),
  notes: z.string().optional(),
  sharedWith: z.array(z.number()).optional(),
});

const updatePasswordSchema = insertPasswordSchema.partial();

/**
 * Create a password in the current organization's database
 */
export async function createPassword(data: z.infer<typeof insertPasswordSchema>) {
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
    const validateData = insertPasswordSchema.parse(data);

    // Generate a unique UUID as the slug
    const slug = uuidv4();

    // Encrypt password
    const masterPassword = await getMasterPassword();
    const encryptedPassword = encryptPassword(validateData.password, masterPassword);

    await db.insert(passwordsTable).values({
      userId,
      name: validateData.name,
      username: validateData.username,
      password: encryptedPassword,
      slug,
      url: validateData.url || null,
      categoryId: validateData.categoryId || null,
      notes: validateData.notes || null,
      sharedWith: validateData.sharedWith ? JSON.stringify(validateData.sharedWith) : null,
    });

    revalidatePath("/");
    return {
      message: "Password Created!!",
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

/**
 * Get all passwords for the current organization
 */
export async function getPasswords() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
        passwords: [],
      };
    }

    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return {
        error: "No organization selected",
        passwords: [],
      };
    }

    const db = getTenantDb(organizationId);

    // Get passwords owned by user or shared with user
    const passwords = await db.select().from(passwordsTable).where(
      // User owns the password OR password is shared with user
      // Note: This is simplified - in production, you'd want a proper query
      eq(passwordsTable.userId, userId)
    );

    return {
      success: true,
      passwords,
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to fetch passwords",
      passwords: [],
    };
  }
}

/**
 * Update a password
 */
export async function editPassword(id: number, data: z.infer<typeof updatePasswordSchema>) {
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

    // Verify ownership or permission
    const [existingPassword] = await db
      .select()
      .from(passwordsTable)
      .where(and(eq(passwordsTable.id, id), eq(passwordsTable.userId, userId)))
      .limit(1);

    if (!existingPassword) {
      return {
        error: "Password not found or access denied",
      };
    }

    await updatePasswordSchema.parseAsync(data);

    const masterPassword = await getMasterPassword();

    // If password is being changed, save to history
    if (data.password && data.password !== existingPassword.password) {
      await db.insert(passwordHistoryTable).values({
        passwordId: id,
        oldPassword: existingPassword.password,
        changedBy: userId,
      });
    }

    // Encrypt new password if provided
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = encryptPassword(data.password, masterPassword);
    }
    if (data.sharedWith) {
      updateData.sharedWith = JSON.stringify(data.sharedWith);
    }

    await db
      .update(passwordsTable)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(passwordsTable.id, id));

    revalidatePath("/");
    return {
      message: "Password Updated!!",
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

/**
 * Delete a password
 */
export async function deletePassword(id: number) {
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
      .where(and(eq(passwordsTable.id, id), eq(passwordsTable.userId, userId)))
      .limit(1);

    if (!password) {
      return {
        error: "Password not found or access denied",
      };
    }

    await db.delete(passwordsTable).where(eq(passwordsTable.id, id));
    revalidatePath("/");
    redirect(`/`);
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

/**
 * Get decrypted password
 */
export async function getDecryptedPassword(id: number): Promise<string | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return null;
    }

    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return null;
    }

    const db = getTenantDb(organizationId);

    const [password] = await db
      .select()
      .from(passwordsTable)
      .where(and(eq(passwordsTable.id, id), eq(passwordsTable.userId, userId)))
      .limit(1);

    if (!password) {
      return null;
    }

    const masterPassword = await getMasterPassword();
    return decryptPassword(password.password, masterPassword);
  } catch (error) {
    console.error("Error decrypting password:", error);
    return null;
  }
}

/**
 * Get categories for current organization
 */
export async function getCategories() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return [];
    }

    const db = getTenantDb(organizationId);

    return await db.select().from(categoriesTable).where(eq(categoriesTable.userId, userId));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
