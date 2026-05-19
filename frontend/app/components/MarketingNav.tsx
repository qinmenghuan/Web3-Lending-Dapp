"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowUpRight, BookOpen, Coins, Database, Landmark, Shield } from "lucide-react";

import WalletActions from "@/app/components/WalletActions";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const productItems = [
  {
    href: "/vaults",
    title: "Vaults",
    description: "Curated yield routes with a clean entry point for passive capital.",
    icon: Coins,
  },
  {
    href: "/markets",
    title: "Markets",
    description: "Browse isolated lending markets and inspect the live credit surface.",
    icon: Database,
  },
  {
    href: "/deposit",
    title: "Deposit",
    description: "Move directly into wallet-connected supply flows from the homepage.",
    icon: Landmark,
  },
];

const solutionItems = [
  {
    href: "/vaults",
    title: "Earn Products",
    description: "Translate protocol access into a simple product-led investing flow.",
  },
  {
    href: "/markets",
    title: "Credit Markets",
    description: "Expose collateral and lending primitives in isolated market routes.",
  },
  {
    href: "/deposit",
    title: "Wallet Onboarding",
    description: "Keep connection and signature-based auth visible from the first screen.",
  },
];

const resourceItems = [
  {
    href: "https://morpho.org/",
    title: "Morpho Website",
    description: "The live homepage used as the reference for section hierarchy and CTA density.",
  },
  {
    href: "https://docs.morpho.org/",
    title: "Morpho Docs",
    description: "Protocol and developer documentation for deeper implementation follow-up.",
  },
  {
    href: "https://github.com/morpho-org",
    title: "Morpho GitHub",
    description: "Reference repos, contracts, and integration patterns from the source.",
  },
];

function MenuCard({
  href,
  title,
  description,
  external = false,
  className,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  external?: boolean;
  className?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className={cn(
          "group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-4 transition hover:border-[#d8ff72]/45 hover:bg-[linear-gradient(180deg,rgba(216,255,114,0.18),rgba(255,255,255,0.06))]",
          className,
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {Icon ? (
                <div className="flex size-9 items-center justify-center rounded-2xl border border-white/10 bg-black/16 text-[#d8ff72]">
                  <Icon className="size-4" />
                </div>
              ) : null}
              <span className="text-sm font-semibold text-white">{title}</span>
            </div>
            <ArrowUpRight className="size-4 text-[#a9a9a2] transition group-hover:text-white" />
          </div>
          <p className="text-sm leading-6 text-[#bdbdb5]">{description}</p>
        </div>
      </Link>
    </NavigationMenuLink>
  );
}

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111111]/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-[#d8ff72]/30 bg-[#d8ff72]/10 text-[#d8ff72]">
            <Shield className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold uppercase tracking-[0.28em] text-[#d8ff72]">
              Huan Morpho
            </p>
            <p className="truncate text-xs text-[#b6b6ad]">
              Open credit interface
            </p>
          </div>
        </Link>

        <NavigationMenu className="hidden flex-1 justify-center lg:flex">
          <NavigationMenuList className="gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 backdrop-blur">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="rounded-full bg-transparent px-4 text-sm text-white hover:bg-white/8">
                Products
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[640px] gap-3 md:grid-cols-[1.05fr_1fr]">
                  <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,255,114,0.22),transparent_55%),rgba(255,255,255,0.04)] p-5">
                    <span className="text-xs uppercase tracking-[0.28em] text-[#d8ff72]">
                      Product surface
                    </span>
                    <h3 className="mt-3 text-2xl font-semibold text-white">
                      Morpho-style hierarchy, wired into your existing routes.
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#bdbdb5]">
                      The landing page keeps the root experience distinct from the app while
                      routing directly into vaults, markets, and deposit.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {productItems.map((item) => (
                      <MenuCard key={item.title} {...item} />
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="rounded-full bg-transparent px-4 text-sm text-white hover:bg-white/8">
                Solutions
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[540px] gap-3 md:grid-cols-3">
                  {solutionItems.map((item) => (
                    <MenuCard key={item.title} {...item} />
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="rounded-full bg-transparent px-4 text-sm text-white hover:bg-white/8">
                Resources
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[560px] gap-3 md:grid-cols-[0.92fr_1.08fr]">
                  <MenuCard
                    href="https://morpho.org/"
                    title="Benchmark Layout"
                    description="This implementation follows the structure of Morpho's live site while swapping in your own product routes."
                    external
                    className="bg-[radial-gradient(circle_at_top_left,rgba(255,214,102,0.22),transparent_58%),rgba(255,255,255,0.05)]"
                  />
                  <div className="grid gap-3">
                    {resourceItems.map((item) => (
                      <MenuCard key={item.title} {...item} external />
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "rounded-full bg-transparent px-4 text-sm text-white hover:bg-white/8",
                )}
              >
                <Link href="/markets">Launch App</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <WalletActions className="flex items-center gap-3" />
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-3 lg:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          <div className="overflow-x-auto">
            <NavigationMenu viewport={false} className="w-full justify-start">
              <NavigationMenuList className="w-max gap-2">
                {productItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "rounded-full border border-white/10 bg-white/6 px-4 text-sm text-white",
                      )}
                    >
                      <Link href={item.href}>{item.title}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[#b6b6ad]">
              <BookOpen className="size-4 text-[#d8ff72]" />
              Morpho-inspired landing, app-native routes.
            </div>
            <Button asChild className="rounded-full bg-[#d8ff72] px-4 text-black hover:bg-[#c6ef59]">
              <Link href="/markets">Launch</Link>
            </Button>
          </div>
          <WalletActions className="flex flex-wrap items-center gap-3" />
        </div>
      </div>
    </header>
  );
}
