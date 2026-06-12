import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 ${className}`}>{children}</div>;
}

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`glass ${hover ? "glass-hover" : ""} rounded-2xl ${className}`}>{children}</div>
  );
}

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const BTN: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-violet-500 to-cyan-400 text-zinc-950 font-semibold hover:opacity-90",
  ghost: "text-zinc-200 hover:bg-white/5",
  outline: "border border-white/15 text-zinc-100 hover:bg-white/5",
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${BTN[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm transition-all ${BTN[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-mono text-zinc-300 ${className}`}
    >
      {children}
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Card className="px-5 py-4">
      <div className="text-2xl font-bold gradient-text">{value}</div>
      <div className="mt-1 text-xs font-mono uppercase tracking-wide text-zinc-500">{label}</div>
    </Card>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1 font-mono text-sm text-zinc-500">{subtitle}</p>}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-sm text-zinc-500">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card className="px-6 py-12 text-center">
      <p className="font-mono text-sm text-zinc-300">{title}</p>
      {hint && <p className="mt-2 font-mono text-xs text-zinc-500">{hint}</p>}
    </Card>
  );
}

export function short(addr?: string, n = 4): string {
  if (!addr || addr.length < 2 * n + 2) return addr ?? "";
  return `${addr.slice(0, n + 2)}…${addr.slice(-n)}`;
}
