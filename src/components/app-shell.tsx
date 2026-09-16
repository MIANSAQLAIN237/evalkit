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
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Logo className="min-w-0" />
          <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-400 sm:gap-3">
            <span className="hidden max-w-[10rem] truncate sm:inline md:max-w-xs">{name}</span>
            <Button variant="ghost" onClick={logout} className="shrink-0 px-3">
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
