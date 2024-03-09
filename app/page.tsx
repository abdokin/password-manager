import { NewPassword } from "@/components/add-password-form";
import PasswordsList from "@/components/passswords-list";
import { Search } from "@/components/search";
import { db } from "@/data";
import { passwordsTable } from "@/data/schema";
import { count } from "drizzle-orm";

export default async function Home() {
  const [data] = await db
    .select({ count: count() })
    .from(passwordsTable)
    .limit(1);
  return (
    <main className="container py-8 max-w-3xl">
      {data.count > 0 ? (
        <>
          <div className="flex justify-between">
            <h1>{data.count} sites and apps</h1>
            <div className="flex gap-1 items-center">
              <Search />
              <NewPassword />
            </div>
          </div>
          <PasswordsList />
        </>
      ) : (
        <div className="mx-auto flex gap-2 items-center w-fit">
          <p>No Password Found</p>
          <NewPassword />
        </div>
      )}
    </main>
  );
}
