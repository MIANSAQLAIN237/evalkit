"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DemoLaunchButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function launch() {
    setPending(true);
    const response = await fetch("/api/auth/demo", { method: "POST" });
    if (response.ok) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    router.push("/login");
  }

  return (
    <Button onClick={launch} disabled={pending} className={className}>
      {pending ? "Opening demo…" : "Launch live demo"}
    </Button>
  );
}

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this project and all runs?")) return;
    setPending(true);
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Button variant="danger" onClick={onDelete} disabled={pending}>
      Delete
    </Button>
  );
}
