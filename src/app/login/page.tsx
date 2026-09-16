import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-dataset";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10 sm:py-16">
      <Logo />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 break-all text-sm text-zinc-500 sm:break-normal">
        Demo account: {DEMO_EMAIL} / {DEMO_PASSWORD}
      </p>
      <div className="mt-8">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        No account?{" "}
        <Link href="/signup" className="text-emerald-400 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
