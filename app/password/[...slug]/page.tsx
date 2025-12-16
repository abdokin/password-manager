import { format } from "date-fns";
import { and, eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";

import { notFound, redirect } from "next/navigation";

import SiteIcon from "@/components/SiteIcon";
import { EditPasswordForm } from "@/components/add-password-form";
import { CopyButton, PasswordDisplay } from "@/components/password-display";
import { PasswordHistory } from "@/components/password-history";
import { Button } from "@/components/ui/button";
import { getTenantDb } from "@/data/tenant-db";
import { passwordsTable } from "@/data/tenant-schema";
import { getCurrentUserId } from "@/lib/get-session";
import { getCategories, getDecryptedPassword } from "@/lib/tenant-actions";
import { getCurrentOrganizationId } from "@/lib/tenant-context";

export default async function Page({ params }: { params: { slug: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    redirect("/");
  }

  const db = getTenantDb(organizationId);

  const [password] = await db
    .select()
    .from(passwordsTable)
    .where(and(eq(passwordsTable.slug, params.slug), eq(passwordsTable.userId, userId)))
    .limit(1);

  if (!password || !password.name) return notFound();

  const categories = await getCategories();
  const decryptedPassword = await getDecryptedPassword(password.id);

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <SiteIcon url={password.name} />
          {password.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={password.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Site
              </a>
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Username/Email</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg">{password.username}</p>
                <CopyButton text={password.username} />
              </div>
            </div>

            {decryptedPassword && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="flex items-center gap-2 mt-1">
                  <PasswordDisplay password={decryptedPassword} />
                  <CopyButton text={decryptedPassword} />
                </div>
              </div>
            )}

            {password.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{password.notes}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Created: {format(new Date(password.createdAt), "PPp")}</p>
              <p>Updated: {format(new Date(password.updatedAt), "PPp")}</p>
              {password.lastUsed && <p>Last used: {format(new Date(password.lastUsed), "PPp")}</p>}
            </div>
          </div>

          <div>
            <EditPasswordForm id={password.id} values={password} categories={categories} />
          </div>
        </div>

        <div className="mt-8">
          <PasswordHistory passwordId={password.id} />
        </div>
      </div>
    </div>
  );
}
