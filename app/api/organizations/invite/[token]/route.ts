import { and, eq } from "drizzle-orm";

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/data";
import { organizationInvitationsTable, organizationMembersTable } from "@/data/schema";
import { getCurrentUserId } from "@/lib/get-session";
import { setCurrentOrganizationId } from "@/lib/tenant/context";

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get invitation
    const [invitation] = await db
      .select()
      .from(organizationInvitationsTable)
      .where(eq(organizationInvitationsTable.token, params.token))
      .limit(1);

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check if expired
    if (new Date() > new Date(invitation.expiresAt)) {
      return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      return NextResponse.json({ error: "Invitation already accepted" }, { status: 400 });
    }

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(organizationMembersTable)
      .where(
        and(
          eq(organizationMembersTable.organizationId, invitation.organizationId),
          eq(organizationMembersTable.userId, userId)
        )
      )
      .limit(1);

    if (existingMember) {
      return NextResponse.json({ error: "Already a member of this organization" }, { status: 400 });
    }

    // Add user as member
    await db.insert(organizationMembersTable).values({
      userId,
      organizationId: invitation.organizationId,
      role: invitation.role as any,
      invitedBy: invitation.invitedBy,
    });

    // Mark invitation as accepted
    await db
      .update(organizationInvitationsTable)
      .set({ acceptedAt: new Date() })
      .where(eq(organizationInvitationsTable.id, invitation.id));

    // Set as current organization
    await setCurrentOrganizationId(invitation.organizationId);

    return NextResponse.json({
      success: true,
      organizationId: invitation.organizationId,
    });
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
