"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function AppShell({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="hidden sm:inline">{name}</span>
            <Button variant="ghost" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
