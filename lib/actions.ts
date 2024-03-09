"use server";
import { db } from "@/data";
import { z } from "zod";
import {
  insertPasswordSchema,
  passwordsTable,
  updatePasswordSchema,
} from "@/data/schema";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createPassword(
  data: z.infer<typeof insertPasswordSchema>
) {
  try {
    const validateData = await insertPasswordSchema.parseAsync(data);

    // Generate a unique UUID as the slug
    const slug = uuidv4();

    await db.insert(passwordsTable).values({
      name: validateData.name,
      username: validateData.username,
      password: validateData.password,
      slug,
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
  await db.delete(passwordsTable).where(eq(passwordsTable.id, id));
  redirect(`/`);
}

export async function editPassword(
  id: number,
  data: z.infer<typeof updatePasswordSchema>
) {
  try {
    await updatePasswordSchema.parseAsync(data);
    await db
      .update(passwordsTable)
      .set({
        ...data,
      })
      .where(eq(passwordsTable.id, id));
    const [{ slug }] = await db
      .select({ slug: passwordsTable.slug })
      .from(passwordsTable)
      .where(eq(passwordsTable.id, id))
      .limit(1);
    console.log(slug);

    revalidatePath("/password/" + slug, "page");
    return {
      message: "Password Updated!!",
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}
