import { and, eq } from "drizzle-orm";

import { notFound, redirect } from "next/navigation";

import { AcceptInviteForm } from "@/components/accept-invite-form";
import { db } from "@/data";
import { organizationInvitationsTable, organizationMembersTable, usersTable } from "@/data/schema";
import { getCurrentUserId } from "@/lib/get-session";

export default async function InvitePage({ params }: { params: { token: string } }) {
  const userId = await getCurrentUserId();

  // Get invitation
  const [invitation] = await db
    .select()
    .from(organizationInvitationsTable)
    .where(eq(organizationInvitationsTable.token, params.token))
    .limit(1);

  if (!invitation) {
    notFound();
  }

  // Check if expired
  if (new Date() > new Date(invitation.expiresAt)) {
    return (
      <div className="container max-w-md py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Invitation Expired</h1>
        <p className="text-muted-foreground">
          This invitation has expired. Please ask for a new invitation.
        </p>
      </div>
    );
  }

  // Check if already accepted
  if (invitation.acceptedAt) {
    return (
      <div className="container max-w-md py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Already Accepted</h1>
        <p className="text-muted-foreground">This invitation has already been accepted.</p>
      </div>
    );
  }

  // If user is logged in, show accept form
  if (userId) {
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
      redirect("/");
    }

    return <AcceptInviteForm invitation={invitation} />;
  }

  // If not logged in, redirect to login with callback
  redirect(`/login?callbackUrl=/invite/${params.token}`);
}
