import { redirect } from "next/navigation";

import { OrganizationMembers } from "@/components/organization-members";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { getCurrentUserId } from "@/lib/get-session";
import { getOrganization } from "@/lib/organization";
import { getCurrentOrganizationId } from "@/lib/tenant-context";

export default async function OrganizationsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return (
      <main className="container py-8 max-w-5xl">
        <div className="mx-auto flex flex-col gap-4 items-center w-fit py-16">
          <p className="text-lg text-muted-foreground">No organization selected</p>
          <OrganizationSwitcher />
        </div>
      </main>
    );
  }

  const orgResult = await getOrganization(organizationId);
  if (!orgResult.success) {
    return (
      <main className="container py-8 max-w-5xl">
        <div className="mx-auto flex flex-col gap-4 items-center w-fit py-16">
          <p className="text-lg text-muted-foreground">
            {orgResult.error || "Failed to load organization"}
          </p>
        </div>
      </main>
    );
  }

  const organization = orgResult.organization;

  return (
    <main className="container py-8 max-w-5xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground">Manage your team and organization settings</p>
          </div>
          <OrganizationSwitcher />
        </div>

        <OrganizationMembers organizationId={organizationId} userRole={organization.role} />
      </div>
    </main>
  );
}
