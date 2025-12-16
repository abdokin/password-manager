"use client";

import { Eye, Loader2, Shield, Trash2, User, UserPlus, Users } from "lucide-react";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  getOrganizationMembers,
  inviteToOrganization,
  removeMember,
  updateMemberRole,
} from "@/lib/organization";

interface OrganizationMembersProps {
  organizationId: number;
  userRole: string;
}

export function OrganizationMembers({ organizationId, userRole }: OrganizationMembersProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [inviting, setInviting] = useState(false);

  const canManage = userRole === "owner" || userRole === "admin";

  useEffect(() => {
    loadMembers();
  }, [organizationId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const result = await getOrganizationMembers(organizationId);
      if (result.success) {
        setMembers(result.members);
      }
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email is required",
      });
      return;
    }

    setInviting(true);
    try {
      const result = await inviteToOrganization(organizationId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Invitation sent",
          description: `Invitation sent to ${inviteEmail}`,
        });
        setInviteEmail("");
        setInviteOpen(false);
        await loadMembers();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberUserId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      const result = await removeMember(organizationId, memberUserId);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Member removed",
          description: "Member has been removed from the organization",
        });
        await loadMembers();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove member",
      });
    }
  };

  const handleRoleChange = async (
    memberUserId: number,
    newRole: "owner" | "admin" | "member" | "viewer"
  ) => {
    try {
      const result = await updateMemberRole(organizationId, memberUserId, newRole);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Role updated",
          description: "Member role has been updated",
        });
        await loadMembers();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update role",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Shield className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "viewer":
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Team Members
        </h2>
        {canManage && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                    <SelectTrigger id="invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      {userRole === "owner" && <SelectItem value="admin">Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="w-full"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border rounded-lg">
        {members.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No members yet. Invite your first team member!
          </div>
        ) : (
          <div className="divide-y">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <p className="font-medium">{member.email || `User ${member.userId}`}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(v: any) => handleRoleChange(member.userId, v)}
                        disabled={member.role === "owner"}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      {member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(member.userId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {!canManage && (
                    <span className="text-sm text-muted-foreground">{member.role}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
