"use server";

import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { revalidatePath } from "next/cache";

import { db } from "@/data";
import {
  organizationInvitationsTable,
  organizationMembersTable,
  organizationsTable,
  usersTable,
} from "@/data/schema";
import { initializeTenantDb } from "@/data/tenant-db";

import { queueMagicLinkEmail } from "./email-service";
import { getCurrentUserId } from "./get-session";

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "admin", "member", "viewer"]).default("member"),
});

/**
 * Create a new organization
 */
export async function createOrganization(data: z.infer<typeof createOrganizationSchema>) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
      };
    }

    const validatedData = createOrganizationSchema.parse(data);

    // Generate unique slug
    const slug = `${validatedData.name.toLowerCase().replace(/\s+/g, "-")}-${uuidv4().split("-")[0]}`;

    // Create organization
    const [organization] = await db
      .insert(organizationsTable)
      .values({
        name: validatedData.name,
        slug,
      })
      .returning();

    // Initialize tenant database
    await initializeTenantDb(organization.id);

    // Add creator as owner
    await db.insert(organizationMembersTable).values({
      userId,
      organizationId: organization.id,
      role: "owner",
      invitedBy: userId,
    });

    revalidatePath("/");
    return {
      success: true,
      organization,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      };
    }
    return {
      error: error.message || "Failed to create organization",
    };
  }
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

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
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return [];
  }
}

/**
 * Get organization by ID (with permission check)
 */
export async function getOrganization(organizationId: number) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
      };
    }

    // Check if user is a member
    const [membership] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.userId, userId),
          eq(organizationMembersTable.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!membership) {
      return {
        error: "Access denied",
      };
    }

    const [organization] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, organizationId))
      .limit(1);

    if (!organization) {
      return {
        error: "Organization not found",
      };
    }

    return {
      success: true,
      organization: {
        ...organization,
        role: membership.role,
      },
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to get organization",
    };
  }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(organizationId: number) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
      };
    }

    // Check if user is a member
    const [membership] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.userId, userId),
          eq(organizationMembersTable.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!membership) {
      return {
        error: "Access denied",
      };
    }

    const members = await db
      .select({
        id: organizationMembersTable.id,
        userId: organizationMembersTable.userId,
        role: organizationMembersTable.role,
        joinedAt: organizationMembersTable.joinedAt,
        email: usersTable.email,
      })
      .from(organizationMembersTable)
      .innerJoin(usersTable, eq(organizationMembersTable.userId, usersTable.id))
      .where(eq(organizationMembersTable.organizationId, organizationId));

    return {
      success: true,
      members,
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to get members",
    };
  }
}

/**
 * Invite a user to an organization
 */
export async function inviteToOrganization(
  organizationId: number,
  data: z.infer<typeof inviteMemberSchema>
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
      };
    }

    // Check if user has permission (admin or owner)
    const [membership] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.userId, userId),
          eq(organizationMembersTable.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return {
        error: "Insufficient permissions",
      };
    }

    // Check organization limits
    const [organization] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, organizationId))
      .limit(1);

    if (!organization) {
      return {
        error: "Organization not found",
      };
    }

    // Count current members
    const memberCount = await db
      .select()
      .from(organizationMembersTable)
      .where(eq(organizationMembersTable.organizationId, organizationId));

    if (memberCount.length >= organization.maxMembers) {
      return {
        error: `Organization has reached the maximum of ${organization.maxMembers} members`,
      };
    }

    const validatedData = inviteMemberSchema.parse(data);

    // Check if user is already a member
    const [existingUser] = await db
      .select()
      .from(organizationMembersTable)
      .innerJoin(
        organizationsTable,
        eq(organizationMembersTable.organizationId, organizationsTable.id)
      )
      .where(eq(organizationMembersTable.organizationId, organizationId))
      .limit(1);

    // Create invitation token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await db.insert(organizationInvitationsTable).values({
      organizationId,
      email: validatedData.email,
      role: validatedData.role,
      token,
      invitedBy: userId,
      expiresAt,
    });

    // Send invitation email
    const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/${token}`;
    await queueMagicLinkEmail(validatedData.email, token);

    revalidatePath("/");
    return {
      success: true,
      message: "Invitation sent",
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      };
    }
    return {
      error: error.message || "Failed to send invitation",
    };
  }
}

/**
 * Remove a member from an organization
 */
export async function removeMember(organizationId: number, memberUserId: number) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
      };
    }

    // Check if user has permission (admin or owner)
    const [membership] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.userId, userId),
          eq(organizationMembersTable.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return {
        error: "Insufficient permissions",
      };
    }

    // Can't remove yourself if you're the only owner
    if (memberUserId === userId && membership.role === "owner") {
      const owners = await db
        .select()
        .from(organizationMembersTable)
        .where(
          and(
            eq(organizationMembersTable.organizationId, organizationId),
            eq(organizationMembersTable.role, "owner")
          )
        );

      if (owners.length === 1) {
        return {
          error: "Cannot remove the last owner",
        };
      }
    }

    await db
      .delete(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.organizationId, organizationId),
          eq(organizationMembersTable.userId, memberUserId)
        )
      );

    revalidatePath("/");
    return {
      success: true,
      message: "Member removed",
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to remove member",
    };
  }
}

/**
 * Update member role
 */
export async function updateMemberRole(
  organizationId: number,
  memberUserId: number,
  newRole: "owner" | "admin" | "member" | "viewer"
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
      };
    }

    // Check if user has permission (owner only for role changes)
    const [membership] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.userId, userId),
          eq(organizationMembersTable.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!membership || membership.role !== "owner") {
      return {
        error: "Only owners can change roles",
      };
    }

    await db
      .update(organizationMembersTable)
      .set({ role: newRole })
      .where(
        and(
          eq(organizationMembersTable.organizationId, organizationId),
          eq(organizationMembersTable.userId, memberUserId)
        )
      );

    revalidatePath("/");
    return {
      success: true,
      message: "Role updated",
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to update role",
    };
  }
}
