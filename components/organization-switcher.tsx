"use client";

import { Building2, Loader2, Plus } from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
import { createOrganization, getUserOrganizations } from "@/lib/organization";
import { setCurrentOrganizationId } from "@/lib/tenant-context";

export function OrganizationSwitcher() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [orgName, setOrgName] = useState("");

  const handleOrgChange = useCallback(
    async (orgId: string) => {
      const orgIdNum = parseInt(orgId);
      const result = await setCurrentOrganizationId(orgIdNum);
      if (result.success) {
        setCurrentOrgId(orgIdNum);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to switch organization",
        });
      }
    },
    [router, toast]
  );

  const loadOrganizations = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const orgs = await getUserOrganizations();
      setOrganizations(orgs);
      if (orgs.length > 0 && !currentOrgId) {
        // Set first org as current
        const firstOrg = orgs[0];
        await handleOrgChange(firstOrg.id.toString());
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
    } finally {
      setLoading(false);
    }
  }, [session, currentOrgId, handleOrgChange]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleCreateOrg = async () => {
    if (!orgName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Organization name is required",
      });
      return;
    }

    setCreating(true);
    try {
      const result = await createOrganization({ name: orgName.trim() });
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Organization created",
          description: "Your new organization has been created",
        });
        setOrgName("");
        setOpen(false);
        await loadOrganizations();
        if (result.organization) {
          await handleOrgChange(result.organization.id.toString());
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create organization",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Your First Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="My Company"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateOrg();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleCreateOrg}
              disabled={creating || !orgName.trim()}
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentOrgId?.toString() || organizations[0]?.id.toString()}
        onValueChange={handleOrgChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id.toString()}>
              <div className="flex items-center justify-between w-full">
                <span>{org.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{org.role}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="My Company"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateOrg();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleCreateOrg}
              disabled={creating || !orgName.trim()}
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
