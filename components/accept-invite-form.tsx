"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { OrganizationInvitation } from "@/data/schema";

export function AcceptInviteForm({ invitation }: { invitation: OrganizationInvitation }) {
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const response = await fetch(`/api/organizations/invite/${invitation.token}`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error,
        });
      } else {
        setAccepted(true);
        toast({
          title: "Invitation accepted",
          description: "You&apos;ve been added to the organization",
        });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept invitation",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (accepted) {
    return (
      <div className="container max-w-md py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Invitation Accepted!</h1>
        <p className="text-muted-foreground">
          You&apos;ve been added to the organization. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-16">
      <div className="border rounded-lg p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Organization Invitation</h1>
          <p className="text-muted-foreground">
            You&apos;ve been invited to join an organization with the role of{" "}
            <strong>{invitation.role}</strong>.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Role:</strong> {invitation.role}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Invited by:</strong> User #{invitation.invitedBy}
          </p>
        </div>
        <Button onClick={handleAccept} disabled={accepting} className="w-full" size="lg">
          {accepting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Accepting...
            </>
          ) : (
            "Accept Invitation"
          )}
        </Button>
      </div>
    </div>
  );
}
