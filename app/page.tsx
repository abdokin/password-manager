import { NewPassword } from "@/components/add-password-form";
import { ImportExportDialog } from "@/components/import-export-dialog";
import { LandingPage } from "@/components/landing-page";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import PasswordsList from "@/components/passswords-list";
import { getCurrentUserId } from "@/lib/get-session";
import { getCategories, getPasswords } from "@/lib/tenant-actions";
import { getCurrentOrganizationId } from "@/lib/tenant-context";

export default async function Home() {
  const userId = await getCurrentUserId();

  // Show landing page if not authenticated
  if (!userId) {
    return <LandingPage />;
  }

  const organizationId = await getCurrentOrganizationId();

  // If no organization, show organization creation prompt
  if (!organizationId) {
    return (
      <main className="container py-8 max-w-5xl">
        <div className="mx-auto flex flex-col gap-4 items-center w-fit py-16">
          <p className="text-lg text-muted-foreground">No organization selected</p>
          <p className="text-sm text-muted-foreground">
            Create or select an organization to get started
          </p>
          <OrganizationSwitcher />
        </div>
      </main>
    );
  }

  // Get data from tenant database
  const passwordsResult = await getPasswords();
  const categories = await getCategories();

  const passwords = passwordsResult.success ? passwordsResult.passwords : [];
  const passwordCount = passwords.length;

  return (
    <main className="container py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <OrganizationSwitcher />
        </div>
      </div>

      {passwordCount > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{passwordCount} sites and apps</h1>
            <div className="flex gap-2">
              <ImportExportDialog />
              <NewPassword categories={categories} />
            </div>
          </div>
          <PasswordsList passwords={passwords} categories={categories} />
        </>
      ) : (
        <div className="mx-auto flex flex-col gap-4 items-center w-fit py-16">
          <p className="text-lg text-muted-foreground">No passwords found</p>
          <p className="text-sm text-muted-foreground">Get started by adding your first password</p>
          <NewPassword categories={categories} />
        </div>
      )}
    </main>
  );
}
