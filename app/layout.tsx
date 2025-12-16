import type { Metadata } from "next";
import { Inter } from "next/font/google";

import NavBar from "@/components/nav-bar";
import { SessionProvider } from "@/components/session-provider";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Password Manager",
  description: "Secure password management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <NavBar />
          <main>{children}</main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
