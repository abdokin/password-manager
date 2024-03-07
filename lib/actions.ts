"use server";
import { db } from "@/data";
import { z } from "zod";
import { insertPasswordSchema, passwordsTable } from "@/data/schema";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

export async function createPassword(
  data: z.infer<typeof insertPasswordSchema>
) {
  try {
    const validateData = await insertPasswordSchema.parseAsync(data);

    // Generate a unique UUID as the slug
    const slug = uuidv4();

    await db.insert(passwordsTable).values({
      name:validateData.name,
      username:validateData.username,
      password:validateData.password,
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
