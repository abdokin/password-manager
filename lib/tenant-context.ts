"use server";

import { cookies } from "next/headers";

import { getCurrentUserId } from "./get-session";
import { getUserOrganizations } from "./organization";

const CURRENT_ORG_COOKIE = "current_organization_id";

/**
 * Get the current organization ID from cookie or return user's first org
 */
export async function getCurrentOrganizationId(): Promise<number | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const cookieStore = await cookies();
  const orgIdCookie = cookieStore.get(CURRENT_ORG_COOKIE);

  if (orgIdCookie) {
    const orgId = parseInt(orgIdCookie.value);
    if (!isNaN(orgId)) {
      // Verify user is still a member
      const orgs = await getUserOrganizations();
      if (orgs.some((org) => org.id === orgId)) {
        return orgId;
      }
    }
  }

  // Return first organization if available
  const orgs = await getUserOrganizations();
  if (orgs.length > 0) {
    return orgs[0].id;
  }

  return null;
}

/**
 * Set the current organization ID in cookie
 */
export async function setCurrentOrganizationId(organizationId: number) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "Not authenticated" };
  }

  // Verify user is a member
  const orgs = await getUserOrganizations();
  if (!orgs.some((org) => org.id === organizationId)) {
    return { error: "Access denied" };
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORG_COOKIE, organizationId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return { success: true };
}
