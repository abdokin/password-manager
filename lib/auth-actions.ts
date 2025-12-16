"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/data";
import { usersTable } from "@/data/schema";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerUser(data: z.infer<typeof registerSchema>) {
  try {
    const validatedData = registerSchema.parse(data);

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, validatedData.email))
      .limit(1);

    if (existingUser) {
      return {
        error: "User with this email already exists",
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Create user (salt is not needed with bcrypt, but we'll store a placeholder for consistency)
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: validatedData.email,
        passwordHash,
        salt: "", // bcrypt handles salt internally
      })
      .returning();

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      };
    }
    return {
      error: error.message || "Failed to register user",
    };
  }
}
