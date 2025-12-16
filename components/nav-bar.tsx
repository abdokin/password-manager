"use client";

import { LogOut, Shield, User } from "lucide-react";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

import { OrganizationSwitcher } from "./organization-switcher";

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isLandingPage = pathname === "/" && !session;

  // Don't show navbar on landing page (it has its own nav)
  if (isLandingPage) {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-5xl flex w-full justify-between items-center py-4">
        <Link href={"/"} className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Password Manager</h1>
        </Link>
        {session && (
          <div className="flex items-center gap-4">
            <OrganizationSwitcher />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{session.user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
