"use server";

import { and, eq } from "drizzle-orm";

import { cookies } from "next/headers";

import { db } from "@/data";
import { organizationMembersTable, organizationsTable } from "@/data/schema";

import { getCurrentUserId } from "../get-session";
import { createTenantDatabase, getTenantDb } from "./db-manager";

const ORGANIZATION_COOKIE = "current-organization-id";

/**
 * Get the current organization ID from cookies
 */
export async function getCurrentOrganizationId(): Promise<number | null> {
  const cookieStore = await cookies();
  const orgId = cookieStore.get(ORGANIZATION_COOKIE)?.value;
  return orgId ? parseInt(orgId) : null;
}

/**
 * Set the current organization ID in cookies
 */
export async function setCurrentOrganizationId(organizationId: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ORGANIZATION_COOKIE, organizationId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Get current organization context
 */
export async function getCurrentOrganization() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    // Get user's first organization or create one
    const [member] = await db
      .select({
        organizationId: organizationMembersTable.organizationId,
      })
      .from(organizationMembersTable)
      .where(eq(organizationMembersTable.userId, userId))
      .limit(1);

    if (member) {
      await setCurrentOrganizationId(member.organizationId);
      return await getOrganizationById(member.organizationId);
    }
    return null;
  }

  return await getOrganizationById(orgId);
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(organizationId: number) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // Verify user is a member
  const [member] = await db
    .select()
    .from(organizationMembersTable)
    .where(
      and(
        eq(organizationMembersTable.organizationId, organizationId),
        eq(organizationMembersTable.userId, userId)
      )
    )
    .limit(1);

  if (!member) return null;

  const [org] = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, organizationId))
    .limit(1);

  return org;
}

/**
 * Get tenant database for current organization
 */
export async function getTenantDatabase() {
  const org = await getCurrentOrganization();
  if (!org) return null;

  const tenantId = org.id.toString();

  // Ensure tenant database exists
  try {
    await createTenantDatabase(tenantId);
  } catch (error) {
    console.error("Error creating tenant database:", error);
  }

  return getTenantDb(tenantId);
}

/**
 * Get user's role in current organization
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const orgId = await getCurrentOrganizationId();
  if (!orgId) return null;

  const [member] = await db
    .select({ role: organizationMembersTable.role })
    .from(organizationMembersTable)
    .where(
      and(
        eq(organizationMembersTable.organizationId, orgId),
        eq(organizationMembersTable.userId, userId)
      )
    )
    .limit(1);

  return member?.role || null;
}

/**
 * Check if user has permission
 */
export async function hasPermission(
  permission: "read" | "write" | "admin" | "owner"
): Promise<boolean> {
  const role = await getCurrentUserRole();
  if (!role) return false;

  const roleHierarchy: Record<string, number> = {
    viewer: 0,
    member: 1,
    admin: 2,
    owner: 3,
  };

  const permissionLevel: Record<string, number> = {
    read: 0,
    write: 1,
    admin: 2,
    owner: 3,
  };

  return roleHierarchy[role] >= permissionLevel[permission];
}

/**
 * Get all organizations user belongs to
 */
export async function getUserOrganizations() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const memberships = await db
    .select({
      organization: organizationsTable,
      role: organizationMembersTable.role,
      joinedAt: organizationMembersTable.joinedAt,
    })
    .from(organizationMembersTable)
    .innerJoin(
      organizationsTable,
      eq(organizationMembersTable.organizationId, organizationsTable.id)
    )
    .where(eq(organizationMembersTable.userId, userId));

  return memberships.map((m) => ({
    ...m.organization,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
}
