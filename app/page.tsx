import PasswordsList from "@/components/passswords-list";
import { Search } from "@/components/search";
import Image from "next/image";

export default function Home() {
  return (
    <main className="container py-8 max-w-3xl">
      <div className="flex justify-between">
        <h1>149 sites and apps</h1>
        <Search />
      </div>
      <PasswordsList />
    </main>
  );
}
