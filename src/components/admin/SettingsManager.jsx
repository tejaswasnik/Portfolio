"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Dropzone from "@/components/admin/Dropzone";
import Toggle from "@/components/ui/Toggle";
import { CheckIcon, DownloadIcon, LockIcon } from "@/components/ui/icons.jsx";
import { saveSettings, toggleMaintenanceMode, changePassword, exportSiteData } from "@/app/admin/(dashboard)/settings/actions.js";

const fieldLabel = "font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted";
const fieldInput =
  "w-full rounded-lg border border-border-default bg-surface-2 px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus-visible:border-accent";
const cardClass =
  "flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5";

const securityNotes = [
  { title: "Auto-logout", hint: "After 30 minutes of inactivity" },
  { title: "Login lockout", hint: "After 5 failed attempts, with rate limiting" },
  { title: "Sessions", hint: "Secure, HTTP-only cookies via a signed JWT" },
];

/**
 * Admin Settings (Figma 71:7). Site & SEO / Notifications / admin email
 * batch into one "Save settings" action; password change is its own
 * mini-form (requires the current password); maintenance mode is its
 * own instant toggle, same reasoning as the Profile & About form's
 * banner exclusion (docs/DECISIONS.md step 10).
 * @param {{ settings: object | null, adminEmail: string }} props
 */
export default function SettingsManager({ settings, adminEmail }) {
  const router = useRouter();

  const initial = {
    title: settings?.title ?? "",
    description: settings?.description ?? "",
    ogImage: settings?.ogImage ?? "",
    favicon: settings?.favicon ?? "",
    notificationEmail: settings?.notificationEmail ?? "",
    adminEmail,
  };

  const [form, setForm] = useState(initial);
  const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenanceMode ?? false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const [exporting, setExporting] = useState(false);

  function set(key) {
    return (event) => setForm((f) => ({ ...f, [key]: event.target.value }));
  }

  function discard() {
    setForm(initial);
    setFieldErrors({});
    setError("");
  }

  async function handleMaintenanceToggle(next) {
    setMaintenanceMode(next);
    const result = await toggleMaintenanceMode({ value: next });
    if (!result.ok) {
      setMaintenanceMode(!next);
      setError(result.error || "Could not update maintenance mode.");
    } else {
      router.refresh();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    const result = await saveSettings(form);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || "Something went wrong. Please try again.");
      setFieldErrors(result.fieldErrors || {});
      return;
    }

    if (result.requiresReauth) {
      router.replace("/admin/login");
      return;
    }
    router.refresh();
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSubmitting(true);

    const result = await changePassword(passwordForm);
    setPasswordSubmitting(false);

    if (!result.ok) {
      setPasswordError(result.error || "Something went wrong.");
      return;
    }

    router.replace("/admin/login");
  }

  async function handleExport() {
    setExporting(true);
    const result = await exportSiteData();
    setExporting(false);
    if (!result.ok) {
      setError(result.error || "Could not export data.");
      return;
    }

    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[28px] tracking-[-0.95px] text-text-primary sm:text-[38px]">
            Settings
          </h1>
          <p className="font-mono text-[11px] text-text-muted">
            Site details, notifications, account security and data export
          </p>
        </div>
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={discard}
            className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary"
          >
            Discard
          </button>
          <button
            type="submit"
            form="settings-form"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-md border border-cta-bg bg-cta-bg px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-cta-text disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-border-default bg-surface-2 px-3 py-2.5 text-[12px] text-text-secondary"
        >
          {error}
        </p>
      ) : null}

      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <form id="settings-form" onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Site &amp; SEO</p>
              <p className={fieldLabel}>Public metadata</p>
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Site title</span>
              <input value={form.title} onChange={set("title")} required className={fieldInput} />
              {fieldErrors.title ? (
                <span className="text-[11px] text-text-secondary">{fieldErrors.title[0]}</span>
              ) : null}
            </label>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Site description</span>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                required
                className={fieldInput}
              />
            </label>

            <div className="flex w-full gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <span className={fieldLabel}>OG image</span>
                <Dropzone
                  value={form.ogImage}
                  onChange={({ url }) => setForm((f) => ({ ...f, ogImage: url }))}
                  accept="image/*"
                  kind="image"
                  label="OG image"
                  folder="/portfolio/settings"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <span className={fieldLabel}>Favicon</span>
                <Dropzone
                  value={form.favicon}
                  onChange={({ url }) => setForm((f) => ({ ...f, favicon: url }))}
                  accept="image/x-icon,image/png,image/svg+xml"
                  kind="image"
                  label="Favicon"
                  folder="/portfolio/settings"
                />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Notifications</p>
              <p className={fieldLabel}>Contact form</p>
            </div>
            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Admin notification email</span>
              <input
                type="email"
                value={form.notificationEmail}
                onChange={set("notificationEmail")}
                required
                className={fieldInput}
              />
              <span className="font-mono text-[10px] text-text-muted">
                Each new message is emailed here. If sending fails, the message is still saved and
                flagged for retry.
              </span>
              {fieldErrors.notificationEmail ? (
                <span className="text-[11px] text-text-secondary">
                  {fieldErrors.notificationEmail[0]}
                </span>
              ) : null}
            </label>
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">
                Account &amp; security
              </p>
              <p className={fieldLabel}>Single admin</p>
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Admin email</span>
              <input
                type="email"
                value={form.adminEmail}
                onChange={set("adminEmail")}
                required
                className={fieldInput}
              />
              {fieldErrors.adminEmail ? (
                <span className="text-[11px] text-text-secondary">{fieldErrors.adminEmail[0]}</span>
              ) : null}
              <span className="font-mono text-[10px] text-text-muted">
                Changing this signs you out everywhere; sign back in with the new email.
              </span>
            </label>
          </div>
        </form>

        <div className="flex w-full flex-col gap-4 lg:w-[344px]">
          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Maintenance mode</p>
              <p className={fieldLabel}>Public site</p>
            </div>
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-[13px] font-medium text-text-primary">Maintenance mode</p>
                <p className="font-mono text-[10px] text-text-muted">
                  Visitors see a simple message
                </p>
              </div>
              <Toggle
                checked={maintenanceMode}
                label="Maintenance mode"
                onChange={handleMaintenanceToggle}
              />
            </div>
            <p className="font-mono text-[10px] text-text-muted">
              The admin panel keeps working while the public site is paused. Preview the
              maintenance page before turning this on.
            </p>
            <a
              href="/maintenance"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-lg border border-dashed border-border-default px-3 py-2.5 font-mono text-[10px] font-bold uppercase text-text-primary"
            >
              Preview maintenance page
            </a>
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Data export</p>
              <p className={fieldLabel}>JSON</p>
            </div>
            <p className="text-[13px] text-text-secondary">
              Download everything as a single JSON file for backup or migration.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["projects", "skills", "messages", "settings"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-pill border border-border-default bg-surface-3 px-2.5 py-1 font-mono text-[10px] text-text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-cta-bg bg-cta-bg px-3 py-[11px] font-mono text-[10px] font-bold uppercase text-cta-text disabled:opacity-50"
            >
              <DownloadIcon size={12} />
              {exporting ? "Exporting…" : "Export JSON"}
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Password</p>
            </div>
            {passwordError ? (
              <p role="alert" className="text-[11px] text-text-secondary">
                {passwordError}
              </p>
            ) : null}
            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Current password</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((f) => ({ ...f, currentPassword: event.target.value }))
                }
                required
                className={fieldInput}
              />
            </label>
            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>New password</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((f) => ({ ...f, newPassword: event.target.value }))
                }
                placeholder="At least 12 characters"
                minLength={12}
                required
                className={fieldInput}
              />
            </label>
            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Confirm</span>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((f) => ({ ...f, confirmPassword: event.target.value }))
                }
                placeholder="Repeat new password"
                required
                className={fieldInput}
              />
            </label>
            <button
              type="submit"
              disabled={passwordSubmitting}
              className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary disabled:opacity-50"
            >
              <LockIcon size={12} />
              {passwordSubmitting ? "Updating…" : "Update password"}
            </button>
            {securityNotes.map((note) => (
              <div key={note.title} className="flex w-full items-center gap-2.5">
                <CheckIcon size={14} className="shrink-0 text-accent" />
                <p className="flex-1 text-[13px] text-text-primary">{note.title}</p>
                <p className="font-mono text-[10px] text-text-muted">{note.hint}</p>
              </div>
            ))}
          </form>
        </div>
      </div>
    </div>
  );
}
