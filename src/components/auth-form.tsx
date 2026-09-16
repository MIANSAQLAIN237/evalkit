"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ErrorText, Field, TextInput } from "@/components/ui/field";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await api(mode === "login" ? "/api/auth/login" : "/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {mode === "signup" ? (
        <Field label="Name">
          <TextInput name="name" autoComplete="name" required minLength={2} placeholder="Ada Lovelace" />
        </Field>
      ) : null}
      <Field label="Email">
        <TextInput
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
        />
      </Field>
      <Field label="Password" hint={mode === "signup" ? "At least 8 characters" : undefined}>
        <TextInput
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : 1}
        />
      </Field>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
