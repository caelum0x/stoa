"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export const EXPLORER = "https://atlantic.pharosscan.xyz";

type ToastKind = "info" | "success" | "error" | "pending";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  href?: string;
}

interface ToastApi {
  push: (t: Omit<Toast, "id">) => number;
  update: (id: number, patch: Partial<Omit<Toast, "id">>) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const scheduleDismiss = useCallback(
    (id: number, ms: number) => {
      setTimeout(() => dismiss(id), ms);
    },
    [dismiss],
  );

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++counter;
      setToasts((p) => [...p, { ...t, id }]);
      if (t.kind !== "pending") scheduleDismiss(id, 6000);
      return id;
    },
    [scheduleDismiss],
  );

  const update = useCallback(
    (id: number, patch: Partial<Omit<Toast, "id">>) => {
      setToasts((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      if (patch.kind && patch.kind !== "pending") scheduleDismiss(id, 6000);
    },
    [scheduleDismiss],
  );

  return (
    <ToastContext.Provider value={{ push, update, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto glass rounded-xl px-4 py-3 font-mono text-sm shadow-xl ${
              t.kind === "error"
                ? "border-red-500/30 text-red-300"
                : t.kind === "success"
                  ? "border-emerald-400/30 text-emerald-200"
                  : "text-zinc-200"
            }`}
          >
            <div className="flex items-start gap-2">
              {t.kind === "pending" && (
                <span className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />
              )}
              <div className="min-w-0 flex-1 break-words">{t.message}</div>
              <button onClick={() => dismiss(t.id)} className="text-zinc-500 hover:text-white">
                ×
              </button>
            </div>
            {t.href && (
              <a href={t.href} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-cyan-400 hover:underline">
                view on explorer →
              </a>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/// Wrap an async tx-producing action with pending → success/error toasts (with explorer link).
export function useTx() {
  const { push, update } = useToast();
  return useCallback(
    async <T,>(label: string, fn: () => Promise<T>): Promise<T> => {
      const id = push({ kind: "pending", message: `${label}…` });
      try {
        const res = await fn();
        const hash =
          typeof res === "string"
            ? res
            : ((res as { hash?: string; txHash?: string })?.hash ?? (res as { txHash?: string })?.txHash);
        update(id, {
          kind: "success",
          message: `${label} confirmed`,
          href: hash ? `${EXPLORER}/tx/${hash}` : undefined,
        });
        return res;
      } catch (e) {
        update(id, { kind: "error", message: `${label} failed: ${e instanceof Error ? e.message.slice(0, 140) : String(e)}` });
        throw e;
      }
    },
    [push, update],
  );
}
