"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiCloseLine,
} from "@remixicon/react";

// ─── Types ──────────────────────────────────────────────
type ToastVariant = "success" | "error";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (
    message: string,
    options?: { variant?: ToastVariant; duration?: number }
  ) => void;
}

// ─── Context ────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ─── Toast Item ─────────────────────────────────────────
function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, t.duration - 300);

    const removeTimer = setTimeout(() => {
      onDismiss(t.id);
    }, t.duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [t.id, t.duration, onDismiss]);

  const icon =
    t.variant === "success" ? (
      <RiCheckboxCircleFill className="h-5 w-5 shrink-0 text-success-base" />
    ) : (
      <RiErrorWarningFill className="h-5 w-5 shrink-0 text-error-base" />
    );

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border bg-bg-white-0 px-4 py-3 shadow-regular-md transition-all duration-300",
        t.variant === "success"
          ? "border-success-base/20"
          : "border-error-base/20",
        isExiting
          ? "translate-y-2 opacity-0"
          : "translate-y-0 opacity-100 animate-in slide-in-from-bottom-4 fade-in"
      )}
      role="alert"
    >
      {icon}
      <p className="flex-1 text-paragraph-sm text-text-strong-950">
        {t.message}
      </p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(t.id), 300);
        }}
        className="shrink-0 rounded-md p-0.5 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-sub-600"
      >
        <RiCloseLine className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Provider ───────────────────────────────────────────
let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (
      message: string,
      options?: { variant?: ToastVariant; duration?: number }
    ) => {
      const id = `toast-${++toastCounter}`;
      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          variant: options?.variant ?? "success",
          duration: options?.duration ?? 4000,
        },
      ]);
    },
    []
  );

  const contextValue = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container — fixed bottom-left */}
      <div className="fixed bottom-4 left-4 z-9999 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
