import { Building2, Settings as SettingsIcon, Users } from "lucide-react";

import { redirect } from "next/navigation";

import { TeamManagement } from "@/components/team-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUserId } from "@/lib/get-session";
import { getCurrentOrganization } from "@/lib/tenant/context";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/");
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your organization settings and team members</p>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building2 className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          <TeamManagement organizationId={organization.id} />
        </TabsContent>

        <TabsContent value="organization">
          <div className="space-y-4">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-lg">{organization.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plan</label>
                  <p className="text-lg capitalize">{organization.plan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-lg">{new Date(organization.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <p className="text-muted-foreground">Account settings will be available here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
