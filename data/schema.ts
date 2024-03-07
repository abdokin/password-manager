import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

export const passwordsTable = sqliteTable("passwords", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").notNull(),
});
export const insertPasswordSchema = createInsertSchema(passwordsTable).pick({
  name: true,
  username: true,
  password: true,
});
export type Password = typeof passwordsTable.$inferInsert;
export type NewPassword = typeof passwordsTable.$inferInsert;
