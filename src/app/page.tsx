import Link from "next/link";
import { DemoLaunchButton } from "@/components/actions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-dataset";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary">Create account</Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-10">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/90">
              LLM evaluation studio
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
              Measure models like you mean it.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              Upload a JSONL dataset, run OpenAI, Groq, or Ollama, then score exact match,
              contains, and a 1–5 judge. Built as a production-style eval harness — not a chatbot.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <DemoLaunchButton />
              <Link href="/signup">
                <Button variant="secondary">Start empty project</Button>
              </Link>
            </div>
            <p className="mt-4 font-mono text-xs text-zinc-500">
              Demo · {DEMO_EMAIL} / {DEMO_PASSWORD}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-2xl shadow-emerald-500/5">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
              <span>Reasoning Bench v1 · run #14</span>
              <span className="text-emerald-400">completed</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2 font-medium">Model</th>
                  <th className="pb-2 font-medium">Exact</th>
                  <th className="pb-2 font-medium">Judge</th>
                  <th className="pb-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody className="font-mono text-zinc-200">
                <tr className="border-t border-zinc-800">
                  <td className="py-2">gpt-4o-mini</td>
                  <td>80.0%</td>
                  <td>4.21</td>
                  <td>$0.0124</td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="py-2">llama-3.1-8b</td>
                  <td>63.3%</td>
                  <td>3.40</td>
                  <td>$0.0041</td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="py-2">llama3.2</td>
                  <td>46.7%</td>
                  <td>2.88</td>
                  <td>$0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Datasets that travel",
              body: "JSONL in, JSONL/CSV out. prompt, expected, tags. The format labs actually use.",
            },
            {
              title: "Honest scoring",
              body: "Exact match, contains, and a versioned judge. Failures are shown side by side, not hidden.",
            },
            {
              title: "Always demoable",
              body: "No API key? Deterministic fixtures still produce a real leaderboard so recruiters can click around.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
              <h2 className="font-medium text-zinc-100">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{item.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
