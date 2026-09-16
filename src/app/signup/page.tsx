import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-16">
      <Logo />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-zinc-500">Local-only auth with httpOnly session cookies.</p>
      <div className="mt-8">
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        Already registered?{" "}
        <Link href="/login" className="text-emerald-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
