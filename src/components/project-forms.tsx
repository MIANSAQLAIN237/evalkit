"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ErrorText, Field, TextArea, TextInput } from "@/components/ui/field";

export function CreateProjectForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const result = await api<{ project: { id: string } }>("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description") ?? "",
        }),
      });
      router.push(`/projects/${result.project.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create project");
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-5">
      <Field label="Project name">
        <TextInput name="name" required minLength={2} placeholder="Reasoning Bench v1" />
      </Field>
      <Field label="Description">
        <TextArea name="description" rows={3} placeholder="What is this eval for?" />
      </Field>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Creating…" : "Create project"}
      </Button>
    </form>
  );
}

export function UploadDatasetForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [jsonl, setJsonl] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setJsonl(await file.text());
  }

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await api(`/api/projects/${projectId}/datasets`, {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          jsonl,
        }),
      });
      setJsonl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-5">
      <Field label="Dataset name">
        <TextInput name="name" required minLength={2} placeholder="core-30" />
      </Field>
      <Field label="JSONL file" hint='Each line: {"prompt":"...","expected":"...","tags":["math"]}'>
        <input
          type="file"
          accept=".jsonl,.json,.txt"
          className="block w-full min-w-0 max-w-full text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-zinc-100"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
      </Field>
      <Field label="Or paste JSONL">
        <TextArea
          rows={6}
          value={jsonl}
          onChange={(event) => setJsonl(event.target.value)}
          placeholder={'{"prompt":"What is 2+2?","expected":"4","tags":["math"]}'}
        />
      </Field>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" disabled={pending || !jsonl.trim()} className="w-full sm:w-auto">
        {pending ? "Importing…" : "Import dataset"}
      </Button>
    </form>
  );
}
