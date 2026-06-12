"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "./WalletProvider";
import { short } from "./ui";

const LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/agents", label: "Agents" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contracts", label: "Contracts" },
  { href: "/social", label: "Social" },
  { href: "/activity", label: "Activity" },
  { href: "/skills", label: "Skills" },
  { href: "/playground", label: "Playground" },
];

export function Navbar() {
  const pathname = usePathname();
  const { address, balance, connecting, isPharos, connect, switchToPharos } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07070b]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 font-bold text-zinc-950">
            S
          </span>
          <span className="font-mono text-lg font-bold tracking-tight">stoa</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {address && !isPharos && (
            <button
              onClick={switchToPharos}
              className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-mono text-amber-300 hover:bg-amber-400/20"
            >
              Switch to Pharos
            </button>
          )}
          {address ? (
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {balance != null && <span className="text-zinc-400">{Number(balance).toFixed(3)} PHRS</span>}
              <span className="text-zinc-200">{short(address)}</span>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-1.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Connect wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
