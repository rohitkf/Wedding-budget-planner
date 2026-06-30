"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, X, XCircle, Info } from "lucide-react";
import clsx from "clsx";

type ToastVariant = "success" | "error" | "info";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
  duration: number;
}

interface ToastOptions {
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = ++idRef.current;
      const duration = options?.duration ?? (options?.action ? 6000 : 3500);
      setToasts((prev) => [
        ...prev,
        { id, message, variant: options?.variant ?? "info", action: options?.action, duration },
      ]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "flex items-start gap-2 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
              "bg-surface text-foreground border-border-subtle"
            )}
          >
            {t.variant === "success" && (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            )}
            {t.variant === "error" && <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />}
            {t.variant === "info" && <Info className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />}
            <div className="flex-1 text-sm">{t.message}</div>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
                className="text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
              >
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} className="text-foreground/40 hover:text-foreground/70 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
