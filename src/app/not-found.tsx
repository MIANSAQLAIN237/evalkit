import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-10 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-zinc-500">That project or run does not exist, or you do not own it.</p>
      <div className="mt-6 flex justify-center">
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
