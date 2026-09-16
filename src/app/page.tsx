import Link from "next/link";
import { DemoLaunchButton } from "@/components/actions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-dataset";

const PREVIEW_ROWS = [
  { model: "gpt-4o-mini", exact: "80.0%", judge: "4.21", cost: "$0.0124" },
  { model: "llama-3.1-8b", exact: "63.3%", judge: "3.40", cost: "$0.0041" },
  { model: "llama3.2", exact: "46.7%", judge: "2.88", cost: "$0" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <Logo className="min-w-0" />
          <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link href="/login">
              <Button variant="ghost" className="px-3">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" className="px-3">
                <span className="sm:hidden">Sign up</span>
                <span className="hidden sm:inline">Create account</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <section className="grid items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div className="min-w-0">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400/90 sm:mb-4 sm:text-xs sm:tracking-[0.2em]">
              LLM evaluation studio
            </p>
            <h1 className="max-w-xl text-[clamp(1.75rem,6vw,3rem)] font-semibold leading-[1.12] tracking-tight text-zinc-50">
              Measure models like you mean it.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
              Upload a JSONL dataset, run OpenAI, Groq, or Ollama, then score exact match,
              contains, and a 1–5 judge. Built as a production-style eval harness — not a chatbot.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
              <DemoLaunchButton className="w-full sm:w-auto" />
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Start empty project
                </Button>
              </Link>
            </div>
            <p className="mt-4 break-all font-mono text-[11px] text-zinc-500 sm:break-normal sm:text-xs">
              Demo · {DEMO_EMAIL} / {DEMO_PASSWORD}
            </p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 shadow-2xl shadow-emerald-500/5 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 text-[11px] text-zinc-500 sm:text-xs">
              <span className="min-w-0 truncate">Reasoning Bench v1 · run #14</span>
              <span className="shrink-0 text-emerald-400">completed</span>
            </div>

            <div className="space-y-2 sm:hidden">
              {PREVIEW_ROWS.map((row) => (
                <div key={row.model} className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5">
                  <p className="font-mono text-sm text-zinc-100">{row.model}</p>
                  <div className="mt-1.5 grid grid-cols-3 gap-2 text-[11px] text-zinc-400">
                    <span>Exact {row.exact}</span>
                    <span>Judge {row.judge}</span>
                    <span>Cost {row.cost}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="pb-2 font-medium">Model</th>
                    <th className="pb-2 font-medium">Exact</th>
                    <th className="pb-2 font-medium">Judge</th>
                    <th className="pb-2 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-zinc-200">
                  {PREVIEW_ROWS.map((row) => (
                    <tr key={row.model} className="border-t border-zinc-800">
                      <td className="py-2 pr-3">{row.model}</td>
                      <td className="py-2 pr-3">{row.exact}</td>
                      <td className="py-2 pr-3">{row.judge}</td>
                      <td className="py-2">{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-3 sm:mt-14 sm:gap-4 md:grid-cols-3 lg:mt-20">
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
            <article
              key={item.title}
              className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 sm:p-5"
            >
              <h2 className="font-medium text-zinc-100">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{item.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
