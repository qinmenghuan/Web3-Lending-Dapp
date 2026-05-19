import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  ChartNoAxesCombined,
  CheckCircle2,
  Database,
  Fingerprint,
  Layers3,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import MarketingNav from "@/app/components/MarketingNav";
import { Button } from "@/components/ui/button";

const protocolHighlights = [
  {
    label: "Open by default",
    value: "Composable architecture",
    description:
      "Frontend, API, contracts, and wallet auth stay modular and ready to evolve.",
  },
  {
    label: "App-native conversion",
    value: "Vaults / Markets / Deposit",
    description:
      "The homepage routes users directly into the product surfaces that already exist.",
  },
  {
    label: "Wallet-first",
    value: "RainbowKit + wagmi",
    description:
      "Connection and signature login remain visible at the top-level navigation.",
  },
];

const solutionCards = [
  {
    eyebrow: "Earn",
    title: "Curated vault discovery",
    copy: "Shape a yield-focused entry point that feels like a product homepage instead of a starter template.",
  },
  {
    eyebrow: "Borrow",
    title: "Market-led credit navigation",
    copy: "Promote isolated market browsing as a first-class path into onchain borrowing and collateral flows.",
  },
  {
    eyebrow: "Build",
    title: "Composable lending interface",
    copy: "Keep the wallet layer, backend modules, and protocol routes aligned for future product expansion.",
  },
];

const infrastructureCards = [
  {
    title: "Frontend",
    copy: "Next.js App Router, Tailwind v4, and shadcn/radix wrappers make the landing shell consistent with the app UI.",
    icon: Layers3,
  },
  {
    title: "Wallet Layer",
    copy: "RainbowKit and wagmi already power the connection flow, so the homepage keeps that behavior within reach.",
    icon: Wallet,
  },
  {
    title: "Backend",
    copy: "NestJS modules for markets, loans, auth, and blockchain listeners support a product story grounded in real features.",
    icon: Database,
  },
  {
    title: "Protocol Surface",
    copy: "Contracts, market routes, and deposit flows keep the page tied to actual lending primitives instead of placeholder marketing.",
    icon: Blocks,
  },
];

const trustPillars = [
  "Typed frontend and backend boundaries",
  "Reusable wallet signature login",
  "Composable vault and market routes",
  "Radix-based navigation hierarchy",
  "Responsive layout tuned for product launch",
  "Ready to grow into a fuller protocol dashboard",
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111111] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_top,rgba(216,255,114,0.24),transparent_42%),radial-gradient(circle_at_18%_18%,rgba(255,214,102,0.18),transparent_26%),linear-gradient(180deg,#141414_0%,#111111_62%,#121212_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[24rem] h-[28rem] bg-[radial-gradient(circle_at_80%_10%,rgba(162,240,214,0.12),transparent_22%),radial-gradient(circle_at_18%_72%,rgba(255,255,255,0.06),transparent_26%)]" />

      <MarketingNav />

      <main className="relative">
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_24rem] lg:items-end">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8ff72]/25 bg-[#d8ff72]/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-[#d8ff72]">
                <Sparkles className="size-3.5" />
                Morpho-inspired homepage
              </div>
              <h1 className="mt-7 max-w-5xl text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Connect to the open credit network through your existing stack.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#c6c6c1] sm:text-lg">
                The homepage borrows the product rhythm of morpho.org, but every
                section maps back to this repo&apos;s real surfaces: vaults,
                markets, deposits, wallet auth, and lending infrastructure.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-[#d8ff72] px-6 text-black hover:bg-[#c6ef59]"
                >
                  <Link href="/vaults">
                    Explore Vaults
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/6 px-6 text-white backdrop-blur hover:bg-white/10"
                >
                  <Link href="/markets">Browse Markets</Link>
                </Button>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {protocolHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                  >
                    <p className="text-xs uppercase tracking-[0.28em] text-[#d8ff72]">
                      {item.label}
                    </p>
                    <p className="mt-4 text-xl font-semibold text-white">
                      {item.value}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#bdbdb5]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-6 shadow-[0_20px_65px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d8ff72]">
                    Current stack
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    Built for product velocity
                  </p>
                </div>
                <Fingerprint className="size-9 text-[#d8ff72]" />
              </div>
              <div className="mt-6 space-y-4">
                {[
                  "Next.js 16 + React 19",
                  "Tailwind v4 + shadcn/radix",
                  "RainbowKit wallet connection",
                  "NestJS backend modules",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 text-[#d8ff72]" />
                    <span className="text-sm leading-6 text-[#d9d9d2]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-[#d8ff72]/16 bg-[#d8ff72]/8 p-4">
                <p className="text-sm leading-6 text-[#ebf2cf]">
                  Navigation uses your existing radix-ui menu wrapper, so the
                  homepage stays inside the current design system instead of
                  becoming a disconnected marketing page.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-5 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d8ff72]">
                  Powered by the repo
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Product messaging mapped to implementation-ready flows
                </h2>
              </div>
              <div className="grid flex-1 gap-3 text-sm sm:grid-cols-3 lg:max-w-3xl">
                {["Vault UX", "Market discovery", "Wallet auth"].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-black/15 px-4 py-2 text-center text-[#d9d9d2]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d8ff72]">
              Built for scale
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Enterprise-grade hierarchy without breaking app-native routing.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#c6c6c1]">
              The section order follows Morpho&apos;s homepage logic: hero,
              product pillars, architecture trust, and a final CTA. The
              difference is that the content is tied to what your app already
              supports instead of fabricated protocol stats.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {solutionCards.map((card) => (
              <article
                key={card.title}
                className="group rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-7 transition hover:-translate-y-1 hover:border-[#d8ff72]/35"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-[#d8ff72]">
                  {card.eyebrow}
                </p>
                <h3 className="mt-5 text-2xl font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#bdbdb5]">
                  {card.copy}
                </p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white">
                  Read the flow
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,255,114,0.22),transparent_48%),rgba(255,255,255,0.04)] p-7">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d8ff72]">
                Open by default
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
                Secure by design, extensible by architecture.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#c6c6c1]">
                Rather than imitating protocol TVL numbers, the page leans on
                the real strengths of this codebase: typed modules,
                wallet-native auth, isolated market routing, and reusable UI
                primitives.
              </p>
              <div className="mt-8 flex items-center gap-3 text-sm text-[#d9d9d2]">
                <ShieldCheck className="size-5 text-[#d8ff72]" />
                Ready to expand into a fuller protocol front-end.
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {infrastructureCards.map(({ title, copy, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-white/12 bg-black/18 text-[#d8ff72]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#bdbdb5]">
                    {copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(216,255,114,0.16),rgba(255,255,255,0.04)_32%,rgba(255,214,102,0.12)_100%)] p-7 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d8ff72]">
                  Trust layer
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                  A homepage that sells the system you actually built.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[#d9d9d2]">
                  The result is closer to a modern credit network landing page
                  than a scaffolded wallet demo, while still respecting the
                  current frontend, backend, and routing architecture.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {trustPillars.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/18 px-4 py-3"
                  >
                    <ChartNoAxesCombined className="mt-0.5 size-4 text-[#d8ff72]" />
                    <span className="text-sm leading-6 text-white/88">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 pt-4 lg:px-8 lg:pb-32">
          <div className="flex flex-col gap-8 rounded-[2.25rem] border border-white/10 bg-black/20 px-7 py-10 backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d8ff72]">
                Launch ready
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                Unlock the next layer of your onchain lending interface.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#c6c6c1]">
                Start from vault discovery, deepen into market detail, and keep
                wallet connection within reach from the very first screen.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-[#d8ff72] px-6 text-black hover:bg-[#c6ef59]"
              >
                <Link href="/vaults">Go to Vaults</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/15 bg-white/6 px-6 text-white hover:bg-white/10"
              >
                <Link href="/markets">Open Markets</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
