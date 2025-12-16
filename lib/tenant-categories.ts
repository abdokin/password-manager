"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { revalidatePath } from "next/cache";

import { getTenantDb } from "@/data/tenant-db";
import { categoriesTable } from "@/data/tenant-schema";

import { getCurrentUserId } from "./get-session";
import { getCurrentOrganizationId } from "./tenant-context";

const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().optional(),
});

export async function createCategory(data: z.infer<typeof createCategorySchema>) {
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
    const validatedData = createCategorySchema.parse(data);

    // Check if category with same name exists for user
    const [existing] = await db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.userId, userId), eq(categoriesTable.name, validatedData.name)))
      .limit(1);

    if (existing) {
      return {
        error: "Category with this name already exists",
      };
    }

    const [newCategory] = await db
      .insert(categoriesTable)
      .values({
        userId,
        name: validatedData.name,
        color: validatedData.color || null,
      })
      .returning();

    revalidatePath("/");
    return {
      success: true,
      category: newCategory,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      };
    }
    return {
      error: error.message || "Failed to create category",
    };
  }
}

export async function deleteCategory(id: number) {
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
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)))
      .limit(1);

    if (!category) {
      return {
        error: "Category not found or access denied",
      };
    }

    await db
      .delete(categoriesTable)
      .where(and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)));

    revalidatePath("/");
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to delete category",
    };
  }
}

export async function getUserCategories() {
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
