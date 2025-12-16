"use server";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  insertPasswordSchema,
  passwordHistoryTable,
  passwordsTable,
  updatePasswordSchema,
} from "@/data/tenant-schema";

import { authOptions } from "./auth";
import { decryptPassword, encryptPassword } from "./encryption";
import { getCurrentUserId } from "./get-session";
import { getCurrentOrganizationId, getTenantDatabase, hasPermission } from "./tenant/context";

// Get master password from session (in a real app, this would be stored securely)
// For now, we'll use a session-based approach where the master password is derived from user password
async function getMasterPassword(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  // In production, you'd want to store this more securely
  // For now, we'll use a combination approach
  return process.env.MASTER_ENCRYPTION_KEY || "default-key-change-in-production";
}

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

    const tenantDb = await getTenantDatabase();
    if (!tenantDb) {
      return {
        error: "Failed to access organization database",
      };
    }

    const validateData = await insertPasswordSchema.parseAsync(data);

    // Generate a unique UUID as the slug
    const slug = uuidv4();

    // Encrypt password
    const masterPassword = await getMasterPassword();
    const encryptedPassword = encryptPassword(validateData.password, masterPassword);

    await tenantDb.insert(passwordsTable).values({
      organizationId,
      userId,
      name: validateData.name,
      username: validateData.username,
      password: encryptedPassword,
      slug,
      url: validateData.url || null,
      categoryId: validateData.categoryId || null,
      notes: validateData.notes || null,
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

    const tenantDb = await getTenantDatabase();
    if (!tenantDb) {
      return {
        error: "Failed to access organization database",
      };
    }

    // Verify ownership or shared access
    const [password] = await tenantDb
      .select()
      .from(passwordsTable)
      .where(and(eq(passwordsTable.id, id), eq(passwordsTable.organizationId, organizationId)))
      .limit(1);

    if (!password) {
      return {
        error: "Password not found or access denied",
      };
    }

    // Check permissions (user must be owner or have write access)
    const hasWriteAccess =
      password.userId === userId ||
      (await hasPermission("write")) ||
      (await hasPermission("admin")) ||
      (await hasPermission("owner"));

    if (!hasWriteAccess) {
      return {
        error: "You don't have permission to delete this password",
      };
    }

    await tenantDb.delete(passwordsTable).where(eq(passwordsTable.id, id));
    revalidatePath("/");
    redirect(`/`);
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

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

    const tenantDb = await getTenantDatabase();
    if (!tenantDb) {
      return {
        error: "Failed to access organization database",
      };
    }

    // Verify ownership or shared access
    const [existingPassword] = await tenantDb
      .select()
      .from(passwordsTable)
      .where(and(eq(passwordsTable.id, id), eq(passwordsTable.organizationId, organizationId)))
      .limit(1);

    if (!existingPassword) {
      return {
        error: "Password not found or access denied",
      };
    }

    // Check permissions
    const hasWriteAccess =
      existingPassword.userId === userId ||
      (await hasPermission("write")) ||
      (await hasPermission("admin")) ||
      (await hasPermission("owner"));

    if (!hasWriteAccess) {
      return {
        error: "You don't have permission to edit this password",
      };
    }

    await updatePasswordSchema.parseAsync(data);

    const masterPassword = await getMasterPassword();

    // If password is being changed, save to history
    if (data.password && data.password !== existingPassword.password) {
      await tenantDb.insert(passwordHistoryTable).values({
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

    await tenantDb
      .update(passwordsTable)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(passwordsTable.id, id));

    const [{ slug }] = await tenantDb
      .select({ slug: passwordsTable.slug })
      .from(passwordsTable)
      .where(eq(passwordsTable.id, id))
      .limit(1);

    revalidatePath("/password/" + slug, "page");
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

    const tenantDb = await getTenantDatabase();
    if (!tenantDb) {
      return null;
    }

    const [password] = await tenantDb
      .select()
      .from(passwordsTable)
      .where(and(eq(passwordsTable.id, id), eq(passwordsTable.organizationId, organizationId)))
      .limit(1);

    if (!password) {
      return null;
    }

    // Check read permissions
    const hasReadAccess =
      password.userId === userId ||
      (await hasPermission("read")) ||
      (await hasPermission("write")) ||
      (await hasPermission("admin")) ||
      (await hasPermission("owner"));

    if (!hasReadAccess) {
      return null;
    }

    const masterPassword = await getMasterPassword();
    return decryptPassword(password.password, masterPassword);
  } catch (error) {
    console.error("Error decrypting password:", error);
    return null;
  }
}
