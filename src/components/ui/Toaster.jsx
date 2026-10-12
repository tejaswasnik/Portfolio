"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertIcon, CheckIcon, InfoIcon } from "@/components/ui/icons.jsx";
import { DEFAULT_TOAST_DURATION, dismissToast, pushToast, toastRole } from "@/lib/toast.js";

const ToastContext = createContext(null);

const ICONS = { success: CheckIcon, error: AlertIcon, info: InfoIcon };
const ICON_COLOR = { success: "text-accent", error: "text-danger", info: "text-text-secondary" };

let nextId = 0;

/**
 * Action-feedback toasts (design.md §21, fixes round 2 Fix 5): bottom-
 * left, stacked (max 3 visible), auto-dismiss (4s, errors 8s), pause on
 * hover/focus, `aria-live="polite"` container with `role="alert"` on
 * error toasts specifically. Mounted once in the root layout so every
 * page — public or admin — can call `useToast()`.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => dismissToast(current, id));
  }, []);

  const push = useCallback((type, message, opts = {}) => {
    const id = ++nextId;
    const duration = opts.duration ?? DEFAULT_TOAST_DURATION[type];
    setToasts((current) => pushToast(current, { id, type, message, duration, ...opts }));
    return id;
  }, []);

  const toast = {
    success: (message, opts) => push("success", message, opts),
    error: (message, opts) => push("error", message, opts),
    info: (message, opts) => push("info", message, opts),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/** @returns {{ success: (message: string, opts?: object) => number, error: (message: string, opts?: object) => number, info: (message: string, opts?: object) => number, dismiss: (id: number) => void }} */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast() must be called within a ToastProvider");
  }
  return context;
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-start sm:bottom-4 sm:left-4 sm:right-auto sm:p-0 lg:bottom-6 lg:left-6"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(toast.duration);
  const startedAtRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!toast.duration) return undefined;

    function start() {
      startedAtRef.current = Date.now();
      timerRef.current = setTimeout(onDismiss, remainingRef.current);
    }

    if (!paused) start();

    return () => {
      clearTimeout(timerRef.current);
      if (startedAtRef.current !== null) {
        remainingRef.current = Math.max(
          0,
          remainingRef.current - (Date.now() - startedAtRef.current),
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-runs only when `paused` flips; onDismiss/toast.duration are stable for this toast's lifetime
  }, [paused]);

  const Icon = ICONS[toast.type];

  return (
    <div
      role={toastRole(toast.type)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="animate-toast-in pointer-events-auto flex w-full max-w-[400px] items-start gap-2.5 rounded-[10px] border border-border-default bg-surface-1 p-3.5 shadow-[0_8px_24px_rgb(0_0_0_/_0.35)] sm:w-[360px]"
    >
      <Icon size={16} className={`mt-0.5 shrink-0 ${ICON_COLOR[toast.type]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-[18px] text-text-primary">{toast.message}</p>
        {toast.detail ? (
          <p className="mt-1 font-mono text-[10px] text-text-muted">{toast.detail}</p>
        ) : null}
        {toast.actionLabel && toast.onAction ? (
          <button
            type="button"
            onClick={() => {
              toast.onAction();
              onDismiss();
            }}
            className="mt-1.5 font-mono text-[10px] font-bold uppercase text-accent hover:underline"
          >
            {toast.actionLabel}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 text-text-muted hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        ✕
      </button>
    </div>
  );
}
