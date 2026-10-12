"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { EyeIcon, LockIcon, MailIcon, ShieldIcon } from "@/components/ui/icons.jsx";
import { loginSchema } from "@/lib/schemas/user.js";

/**
 * The sign-in card (Figma 57:2 default / 57:70 error state) — one
 * component covers both, swapping in the error banner when the server
 * rejects the attempt. Lockout/"N attempts left" copy matches the real
 * frame text verbatim.
 */
export default function LoginForm() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Enter a valid email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitting(false);
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setSubmitting(false);
      setError("Something went wrong. Please check your connection and try again.");
    }
  }

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6 rounded-2xl border border-border-subtle bg-surface-1 p-8">
      <span className="flex size-8 items-center justify-center rounded-lg border border-border-default bg-surface-3 text-accent">
        <LockIcon size={16} />
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-[32px] leading-[40px] text-text-primary">Welcome back.</h1>
        <p className="text-[13px] leading-[21px] text-text-secondary">
          Sign in to manage your portfolio, projects and messages.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error ? (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3 py-2.5 text-[11px] text-text-secondary"
          >
            <ShieldIcon size={12} className="shrink-0 text-text-muted" />
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <label htmlFor={emailId} className="font-mono text-[10px] uppercase tracking-[0.8px] text-text-muted">
            Email
          </label>
          <span className="flex h-10 items-center gap-2.5 rounded-lg border border-border-default bg-bg px-3 focus-within:border-accent">
            <MailIcon size={14} className="shrink-0 text-text-muted" />
            <input
              id={emailId}
              type="email"
              autoComplete="username"
              placeholder="admin@yourdomain.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={passwordId} className="font-mono text-[10px] uppercase tracking-[0.8px] text-text-muted">
            Password
          </label>
          <span className="flex h-10 items-center gap-2.5 rounded-lg border border-border-default bg-bg px-3 focus-within:border-accent">
            <LockIcon size={14} className="shrink-0 text-text-muted" />
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="shrink-0 text-text-muted hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <EyeIcon size={14} />
            </button>
          </span>
        </div>

        <p className="flex items-center gap-2 font-mono text-[10px] text-text-muted">
          <ShieldIcon size={12} className="shrink-0" />
          Repeated failed attempts lock sign-in for 15 minutes.
        </p>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center font-mono text-[10px] text-text-muted">
          Single admin account · session ends after inactivity
        </p>
      </form>
    </div>
  );
}
