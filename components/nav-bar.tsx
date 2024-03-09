import Link from "next/link";
import React from "react";

export default function NavBar() {
  return (
    <div className="container max-w-3xl flex w-full justify-between py-8 border-b shadow-sm">
      <Link href={"/"}>
        <h1>Password Managaer</h1>
      </Link>
    </div>
  );
}
