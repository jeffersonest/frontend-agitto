"use client";
import Link from "next/link";
import UserMenu from "@/components/user-menu";
import { Logo } from "@/components/ui/logo";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/events" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
