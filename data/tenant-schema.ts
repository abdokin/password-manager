import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// TENANT-SPECIFIC SCHEMA
// These tables exist in each organization's separate database
// ============================================

// Categories table (tenant-specific)
export const categoriesTable = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(), // Reference to user in main DB
  name: text("name").notNull(),
  color: text("color"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Passwords table with enhanced fields (tenant-specific)
export const passwordsTable = sqliteTable("passwords", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(), // Reference to user in main DB
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").notNull(), // Encrypted
  url: text("url"),
  categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  notes: text("notes"),
  sharedWith: text("shared_with"), // JSON array of user IDs who have access
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  lastUsed: integer("last_used", { mode: "timestamp" }),
});

// Password history table for audit trail (tenant-specific)
export const passwordHistoryTable = sqliteTable("password_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  passwordId: integer("password_id")
    .notNull()
    .references(() => passwordsTable.id, { onDelete: "cascade" }),
  oldPassword: text("old_password").notNull(), // Encrypted
  changedAt: integer("changed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  changedBy: integer("changed_by"), // Reference to user in main DB
});

// Shared passwords (for team collaboration)
export const sharedPasswordsTable = sqliteTable("shared_passwords", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  passwordId: integer("password_id")
    .notNull()
    .references(() => passwordsTable.id, { onDelete: "cascade" }),
  sharedWithUserId: integer("shared_with_user_id").notNull(), // Reference to user in main DB
  permission: text("permission").notNull().default("view"), // view, edit
  sharedAt: integer("shared_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  sharedBy: integer("shared_by").notNull(), // Reference to user in main DB
});

// Relations
export const passwordsRelations = relations(passwordsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [passwordsTable.categoryId],
    references: [categoriesTable.id],
  }),
  history: many(passwordHistoryTable),
  sharedWith: many(sharedPasswordsTable),
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  passwords: many(passwordsTable),
}));

export const passwordHistoryRelations = relations(passwordHistoryTable, ({ one }) => ({
  password: one(passwordsTable, {
    fields: [passwordHistoryTable.passwordId],
    references: [passwordsTable.id],
  }),
}));

export const sharedPasswordsRelations = relations(sharedPasswordsTable, ({ one }) => ({
  password: one(passwordsTable, {
    fields: [sharedPasswordsTable.passwordId],
    references: [passwordsTable.id],
  }),
}));

// Schemas for validation
export const insertPasswordSchema = createInsertSchema(passwordsTable).pick({
  name: true,
  username: true,
  password: true,
  url: true,
  categoryId: true,
  notes: true,
  sharedWith: true,
});

export const updatePasswordSchema = createInsertSchema(passwordsTable).pick({
  name: true,
  username: true,
  password: true,
  url: true,
  categoryId: true,
  notes: true,
  sharedWith: true,
});

export const insertCategorySchema = createInsertSchema(categoriesTable).pick({
  name: true,
  color: true,
});

// Types
export type Password = typeof passwordsTable.$inferSelect;
export type NewPassword = typeof passwordsTable.$inferInsert;
export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type PasswordHistory = typeof passwordHistoryTable.$inferSelect;
export type SharedPassword = typeof sharedPasswordsTable.$inferSelect;
