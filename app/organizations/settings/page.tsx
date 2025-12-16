import { redirect } from "next/navigation";

import { OrganizationSwitcher } from "@/components/organization-switcher";
import { SubscriptionPlans } from "@/components/subscription-plans";
import { getSubscription } from "@/lib/billing";
import { getCurrentUserId } from "@/lib/get-session";
import { getOrganization } from "@/lib/organization";
import { getCurrentOrganizationId } from "@/lib/tenant-context";

export default async function OrganizationSettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    redirect("/");
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
  const subscriptionResult = await getSubscription();

  return (
    <main className="container py-8 max-w-5xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Organization Settings</h1>
            <p className="text-muted-foreground">Manage subscription and organization settings</p>
          </div>
          <OrganizationSwitcher />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Subscription Plans</h2>
            <SubscriptionPlans />
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Current Plan</h3>
            {subscriptionResult.success && (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Plan:</span>{" "}
                  {subscriptionResult.subscription.planDetails.name}
                </p>
                <p>
                  <span className="font-medium">Max Members:</span>{" "}
                  {subscriptionResult.subscription.maxMembers === -1
                    ? "Unlimited"
                    : subscriptionResult.subscription.maxMembers}
                </p>
                <p>
                  <span className="font-medium">Max Passwords:</span>{" "}
                  {subscriptionResult.subscription.maxPasswords === -1
                    ? "Unlimited"
                    : subscriptionResult.subscription.maxPasswords}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {subscriptionResult.subscription.subscriptionStatus || "active"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
