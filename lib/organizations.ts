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
} from "@/data/schema";

import { queueMagicLinkEmail } from "./email-service";
import { getCurrentUserId } from "./get-session";
import { createTenantDatabase } from "./tenant/db-manager";

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

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists
    const [existing] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.slug, slug))
      .limit(1);

    if (existing) {
      return {
        error: "Organization with this name already exists",
      };
    }

    // Create organization
    const [newOrg] = await db
      .insert(organizationsTable)
      .values({
        name: validatedData.name,
        slug: slug + "-" + Date.now(), // Add timestamp to ensure uniqueness
      })
      .returning();

    // Add creator as owner
    await db.insert(organizationMembersTable).values({
      userId,
      organizationId: newOrg.id,
      role: "owner",
      invitedBy: userId,
    });

    // Create tenant database
    await createTenantDatabase(newOrg.id.toString());

    revalidatePath("/");
    return {
      success: true,
      organization: newOrg,
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

    const validatedData = inviteMemberSchema.parse(data);

    // Check if user has permission to invite
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

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return {
        error: "You don't have permission to invite members",
      };
    }

    // Check if user is already a member
    const [existingUser] = await db
      .select()
      .from(organizationMembersTable)
      .innerJoin(
        organizationsTable,
        eq(organizationMembersTable.organizationId, organizationsTable.id)
      )
      .where(
        and(
          eq(organizationMembersTable.organizationId, organizationId)
          // We'd need to join with users table to check email
          // For now, we'll check invitations
        )
      )
      .limit(1);

    // Check if invitation already exists
    const [existingInvite] = await db
      .select()
      .from(organizationInvitationsTable)
      .where(
        and(
          eq(organizationInvitationsTable.organizationId, organizationId),
          eq(organizationInvitationsTable.email, validatedData.email),
          eq(organizationInvitationsTable.acceptedAt, null)
        )
      )
      .limit(1);

    if (existingInvite) {
      return {
        error: "Invitation already sent to this email",
      };
    }

    // Create invitation
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const [invitation] = await db
      .insert(organizationInvitationsTable)
      .values({
        organizationId,
        email: validatedData.email,
        role: validatedData.role,
        token,
        invitedBy: userId,
        expiresAt,
      })
      .returning();

    // Send invitation email
    const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/${token}`;
    await queueMagicLinkEmail(validatedData.email, token);

    revalidatePath("/");
    return {
      success: true,
      invitation,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      };
    }
    return {
      error: error.message || "Failed to invite member",
    };
  }
}

/**
 * Remove member from organization
 */
export async function removeMember(organizationId: number, memberId: number) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
      };
    }

    // Check permissions
    const [currentMember] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.organizationId, organizationId),
          eq(organizationMembersTable.userId, userId)
        )
      )
      .limit(1);

    if (!currentMember || (currentMember.role !== "owner" && currentMember.role !== "admin")) {
      return {
        error: "You don't have permission to remove members",
      };
    }

    // Can't remove owner
    const [targetMember] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.organizationId, organizationId),
          eq(organizationMembersTable.userId, memberId)
        )
      )
      .limit(1);

    if (targetMember?.role === "owner") {
      return {
        error: "Cannot remove organization owner",
      };
    }

    await db
      .delete(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.organizationId, organizationId),
          eq(organizationMembersTable.userId, memberId)
        )
      );

    revalidatePath("/");
    return {
      success: true,
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
  memberId: number,
  role: "owner" | "admin" | "member" | "viewer"
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        error: "Not authenticated",
      };
    }

    // Only owner can change roles
    const [currentMember] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.organizationId, organizationId),
          eq(organizationMembersTable.userId, userId)
        )
      )
      .limit(1);

    if (!currentMember || currentMember.role !== "owner") {
      return {
        error: "Only organization owner can change roles",
      };
    }

    await db
      .update(organizationMembersTable)
      .set({ role })
      .where(
        and(
          eq(organizationMembersTable.organizationId, organizationId),
          eq(organizationMembersTable.userId, memberId)
        )
      );

    revalidatePath("/");
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to update role",
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
      return [];
    }

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

    if (!member) {
      return [];
    }

    const members = await db
      .select({
        id: organizationMembersTable.userId,
        role: organizationMembersTable.role,
        joinedAt: organizationMembersTable.joinedAt,
        invitedBy: organizationMembersTable.invitedBy,
        // We'd need to join with users table to get email
        // For now, return what we have
      })
      .from(organizationMembersTable)
      .where(eq(organizationMembersTable.organizationId, organizationId));

    return members;
  } catch (error) {
    console.error("Error fetching organization members:", error);
    return [];
  }
}
