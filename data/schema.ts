import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

// ============================================
// SHARED DATABASE SCHEMA (Main DB)
// ============================================

// Users table for authentication (shared across all tenants)
export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  // 2FA fields
  twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" }).notNull().default(false),
  twoFactorSecret: text("two_factor_secret"), // Encrypted TOTP secret
  backupCodes: text("backup_codes"), // JSON array of backup codes (encrypted)
  // Security fields
  lastLogin: integer("last_login", { mode: "timestamp" }),
  loginAttempts: integer("login_attempts").notNull().default(0),
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Organizations/Teams table
export const organizationsTable = sqliteTable("organizations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("free"), // free, pro, enterprise
  maxMembers: integer("max_members").notNull().default(5),
  maxPasswords: integer("max_passwords").notNull().default(100),
  subscriptionId: text("subscription_id"), // For payment processing
  subscriptionStatus: text("subscription_status").default("active"), // active, cancelled, past_due
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// User-Organization relationship (many-to-many with roles)
export const organizationMembersTable = sqliteTable("organization_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // owner, admin, member, viewer
  joinedAt: integer("joined_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  invitedBy: integer("invited_by").references(() => usersTable.id),
});

// Organization invitations
export const organizationInvitationsTable = sqliteTable("organization_invitations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"),
  token: text("token").notNull().unique(),
  invitedBy: integer("invited_by")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  acceptedAt: integer("accepted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Email verification tokens (shared)
export const verificationTokensTable = sqliteTable("verification_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  identifier: text("identifier").notNull(), // email
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================
// TENANT-SPECIFIC SCHEMA (Per-tenant DB)
// ============================================
// These tables exist in each tenant's separate database

// Categories table
export const categoriesTable = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Passwords table with enhanced fields
export const passwordsTable = sqliteTable("passwords", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").notNull(), // Encrypted
  url: text("url"),
  categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  lastUsed: integer("last_used", { mode: "timestamp" }),
});

// Password history table for audit trail
export const passwordHistoryTable = sqliteTable("password_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  passwordId: integer("password_id")
    .notNull()
    .references(() => passwordsTable.id, { onDelete: "cascade" }),
  oldPassword: text("old_password").notNull(), // Encrypted
  changedAt: integer("changed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  changedBy: integer("changed_by").references(() => usersTable.id),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  organizations: many(organizationMembersTable),
  invitations: many(organizationInvitationsTable),
}));

export const organizationsRelations = relations(organizationsTable, ({ many }) => ({
  members: many(organizationMembersTable),
  invitations: many(organizationInvitationsTable),
}));

export const organizationMembersRelations = relations(organizationMembersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [organizationMembersTable.userId],
    references: [usersTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [organizationMembersTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export const organizationInvitationsRelations = relations(
  organizationInvitationsTable,
  ({ one }) => ({
    organization: one(organizationsTable, {
      fields: [organizationInvitationsTable.organizationId],
      references: [organizationsTable.id],
    }),
    invitedByUser: one(usersTable, {
      fields: [organizationInvitationsTable.invitedBy],
      references: [usersTable.id],
    }),
  })
);

export const passwordsRelations = relations(passwordsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [passwordsTable.userId],
    references: [usersTable.id],
  }),
  category: one(categoriesTable, {
    fields: [passwordsTable.categoryId],
    references: [categoriesTable.id],
  }),
  history: many(passwordHistoryTable),
}));

export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [categoriesTable.userId],
    references: [usersTable.id],
  }),
  passwords: many(passwordsTable),
}));

export const passwordHistoryRelations = relations(passwordHistoryTable, ({ one }) => ({
  password: one(passwordsTable, {
    fields: [passwordHistoryTable.passwordId],
    references: [passwordsTable.id],
  }),
  changedByUser: one(usersTable, {
    fields: [passwordHistoryTable.changedBy],
    references: [usersTable.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(usersTable).pick({
  email: true,
  passwordHash: true,
  salt: true,
});

export const insertPasswordSchema = createInsertSchema(passwordsTable).pick({
  name: true,
  username: true,
  password: true,
  url: true,
  categoryId: true,
  notes: true,
});

export const updatePasswordSchema = createInsertSchema(passwordsTable).pick({
  name: true,
  username: true,
  password: true,
  url: true,
  categoryId: true,
  notes: true,
});

export const insertCategorySchema = createInsertSchema(categoriesTable).pick({
  name: true,
  color: true,
});

// Types
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Organization = typeof organizationsTable.$inferSelect;
export type NewOrganization = typeof organizationsTable.$inferInsert;
export type OrganizationMember = typeof organizationMembersTable.$inferSelect;
export type OrganizationInvitation = typeof organizationInvitationsTable.$inferSelect;
export type Password = typeof passwordsTable.$inferSelect;
export type NewPassword = typeof passwordsTable.$inferInsert;
export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type PasswordHistory = typeof passwordHistoryTable.$inferSelect;
