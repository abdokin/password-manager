import SiteIcon from "@/components/SiteIcon";
import { EditPasswordForm } from "@/components/add-password-form";
import { db } from "@/data";
import { passwordsTable } from "@/data/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } }) {
  const [password] = await db
    .select()
    .from(passwordsTable)
    .where(eq(passwordsTable.slug, params.slug))
    .limit(1);
  if (!password || !password.name) return notFound();

  return (
    <div className="container  max-w-3xl">
      <SiteIcon url={password.name} />
      <div className="ml-auto max-w-lg">
        <EditPasswordForm id={password.id} values={password} />
      </div>
    </div>
  );
}
