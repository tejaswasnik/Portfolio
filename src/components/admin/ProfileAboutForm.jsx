"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Toggle from "@/components/ui/Toggle";
import {
  ArrowUpRightIcon,
  FileIcon,
  MailIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/ui/icons.jsx";
import { toggleSectionVisible } from "@/app/admin/(dashboard)/sections/actions.js";
import { saveProfileAndAbout } from "@/app/admin/(dashboard)/profile/actions.js";

const fieldLabel = "font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted";
const fieldInput =
  "w-full rounded-lg border border-border-default bg-surface-2 px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus-visible:border-accent";
const cardClass =
  "flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5";

/** Builds the initial form state from the server-fetched profile/siteSettings docs. */
function buildInitialState(profile, siteSettings) {
  return {
    photoUrl: profile?.photoUrl ?? "",
    name: profile?.name ?? "",
    location: profile?.location ?? "",
    tagline: profile?.tagline ?? "",
    about: profile?.about ?? "",
    footnote: profile?.footnote ?? "",
    email: profile?.socialLinks?.email ?? "",
    github: profile?.socialLinks?.github ?? "",
    linkedin: profile?.socialLinks?.linkedin ?? "",
    twitter: profile?.socialLinks?.twitter ?? "",
    resumeUrl: profile?.resumeUrl ?? "",
    letsTalkHeading: profile?.letsTalkHeading ?? "",
    letsTalkSubtext: profile?.letsTalkSubtext ?? "",
    footerText: siteSettings?.footerText ?? "",
    githubUsername: siteSettings?.githubUsername ?? "",
  };
}

/**
 * Admin Profile & About (Figma 69:612) — the one form that edits fields
 * spanning three collections: `profile` (identity, about, social links,
 * resume, Let's talk), `siteSettings` (footer text, GitHub username) and
 * `sections` (the "Show heatmap" toggle, saved instantly via the same
 * action the Sections screen uses, not bundled into this form's Save —
 * see docs/DECISIONS.md step 8).
 *
 * Photo and resume are plain URL fields, not the real ImageKit
 * Dropzone/upload — same step-9-pending degradation as the New/Edit
 * project form's cover image.
 *
 * @param {{
 *   profile: object | null,
 *   siteSettings: { footerText?: string, githubUsername?: string } | null,
 *   heatmapSection: { id: string, visible: boolean } | null,
 * }} props
 */
export default function ProfileAboutForm({ profile, siteSettings, heatmapSection }) {
  const router = useRouter();
  const initial = buildInitialState(profile, siteSettings);

  const [form, setForm] = useState(initial);
  const [heatmapVisible, setHeatmapVisible] = useState(heatmapSection?.visible ?? false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key) {
    return (event) => {
      setForm((f) => ({ ...f, [key]: event.target.value }));
      setSaved(false);
    };
  }

  function discard() {
    setForm(initial);
    setFieldErrors({});
    setError("");
    setSaved(false);
  }

  async function handleHeatmapToggle(nextValue) {
    if (!heatmapSection) return;
    setHeatmapVisible(nextValue);
    const result = await toggleSectionVisible({ id: heatmapSection.id, value: nextValue });
    if (!result.ok) {
      setHeatmapVisible(!nextValue);
      setError(result.error || "Could not update the heatmap toggle.");
    } else {
      router.refresh();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    const payload = {
      photoUrl: form.photoUrl,
      name: form.name,
      location: form.location,
      tagline: form.tagline,
      about: form.about,
      footnote: form.footnote,
      socialLinks: {
        email: form.email,
        github: form.github,
        linkedin: form.linkedin,
        twitter: form.twitter,
      },
      resumeUrl: form.resumeUrl,
      letsTalkHeading: form.letsTalkHeading,
      letsTalkSubtext: form.letsTalkSubtext,
      footerText: form.footerText,
      githubUsername: form.githubUsername,
    };

    const result = await saveProfileAndAbout(payload);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || "Something went wrong. Please try again.");
      setFieldErrors(result.fieldErrors || {});
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[38px] tracking-[-0.95px] text-text-primary">
            Profile &amp; About
          </h1>
          <p className="font-mono text-[11px] text-text-muted">
            Everything on the public home page, editable without a redeploy
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
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-md border border-cta-bg bg-cta-bg px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-cta-text disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save changes"}
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

      <div className="flex w-full items-start gap-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Identity</p>
              <p className={fieldLabel}>Profile header</p>
            </div>

            <div className="flex w-full items-center gap-4">
              <div className="flex size-[72px] items-center justify-center rounded-xl border border-border-default bg-surface-2">
                {form.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                  <img src={form.photoUrl} alt="" className="size-full rounded-xl object-cover" />
                ) : (
                  <span className="font-serif text-2xl text-accent">
                    {form.name
                      .split(" ")
                      .map((part) => part[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("") || "—"}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <input
                  type="url"
                  value={form.photoUrl}
                  onChange={set("photoUrl")}
                  placeholder="https://ik.imagekit.io/… (photo URL)"
                  className={fieldInput}
                />
                <p className="font-mono text-[10px] text-text-muted">
                  Square, at least 208 × 208 · stored on ImageKit (URL for now — step 9 adds
                  upload)
                </p>
                {fieldErrors.photoUrl ? (
                  <span className="text-[11px] text-text-secondary">{fieldErrors.photoUrl[0]}</span>
                ) : null}
              </div>
            </div>

            <div className="flex w-full gap-4">
              <label className="flex flex-1 flex-col gap-1.5">
                <span className={fieldLabel}>Name</span>
                <input value={form.name} onChange={set("name")} required className={fieldInput} />
                {fieldErrors.name ? (
                  <span className="text-[11px] text-text-secondary">{fieldErrors.name[0]}</span>
                ) : null}
              </label>
              <label className="flex flex-1 flex-col gap-1.5">
                <span className={fieldLabel}>Location</span>
                <input value={form.location} onChange={set("location")} className={fieldInput} />
              </label>
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Tagline</span>
              <input
                value={form.tagline}
                onChange={set("tagline")}
                required
                className={fieldInput}
              />
              {fieldErrors.tagline ? (
                <span className="text-[11px] text-text-secondary">{fieldErrors.tagline[0]}</span>
              ) : null}
            </label>
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">About</p>
              <p className={fieldLabel}>Plain text · blank line = new paragraph</p>
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>About text</span>
              <textarea
                value={form.about}
                onChange={set("about")}
                rows={8}
                required
                className={fieldInput}
              />
              {fieldErrors.about ? (
                <span className="text-[11px] text-text-secondary">{fieldErrors.about[0]}</span>
              ) : null}
            </label>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Footnote line</span>
              <input value={form.footnote} onChange={set("footnote")} className={fieldInput} />
              <span className="font-mono text-[10px] text-text-muted">
                Shown under the about text with the coffee icon
              </span>
            </label>
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Social links</p>
              <p className={fieldLabel}>Empty links are not shown</p>
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Email</span>
              <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3 py-2.5">
                <MailIcon size={14} className="shrink-0 text-text-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="hello@example.com"
                  className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                />
              </div>
              {fieldErrors.socialLinks ? (
                <span className="text-[11px] text-text-secondary">Check the social links.</span>
              ) : null}
            </label>

            <div className="flex w-full gap-4">
              <label className="flex flex-1 flex-col gap-1.5">
                <span className={fieldLabel}>GitHub</span>
                <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3 py-2.5">
                  <ArrowUpRightIcon size={14} className="shrink-0 text-text-muted" />
                  <input
                    type="url"
                    value={form.github}
                    onChange={set("github")}
                    placeholder="https://github.com/username"
                    className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
              </label>
              <label className="flex flex-1 flex-col gap-1.5">
                <span className={fieldLabel}>LinkedIn</span>
                <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3 py-2.5">
                  <ArrowUpRightIcon size={14} className="shrink-0 text-text-muted" />
                  <input
                    type="url"
                    value={form.linkedin}
                    onChange={set("linkedin")}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
              </label>
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Twitter</span>
              <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3 py-2.5">
                <ArrowUpRightIcon size={14} className="shrink-0 text-text-muted" />
                <input
                  type="url"
                  value={form.twitter}
                  onChange={set("twitter")}
                  placeholder="https://twitter.com/username"
                  className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                />
              </div>
            </label>
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Let&apos;s talk &amp; footer</p>
              <p className={fieldLabel}>Closing section</p>
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Heading</span>
              <input
                value={form.letsTalkHeading}
                onChange={set("letsTalkHeading")}
                required
                className={fieldInput}
              />
            </label>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Subtext</span>
              <textarea
                value={form.letsTalkSubtext}
                onChange={set("letsTalkSubtext")}
                rows={3}
                required
                className={fieldInput}
              />
            </label>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Footer text</span>
              <input
                value={form.footerText}
                onChange={set("footerText")}
                required
                className={fieldInput}
              />
              {fieldErrors.footerText ? (
                <span className="text-[11px] text-text-secondary">{fieldErrors.footerText[0]}</span>
              ) : null}
            </label>
          </div>
        </div>

        <div className="flex w-[344px] flex-col gap-4">
          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Resume</p>
              <p className={fieldLabel}>PDF · ImageKit</p>
            </div>

            {form.resumeUrl ? (
              <div className="flex w-full items-center gap-3 rounded-lg border border-border-subtle bg-surface-2 p-3">
                <span className="flex size-8 items-center justify-center rounded-lg border border-border-icon bg-surface-icon-alt">
                  <FileIcon size={16} className="text-text-secondary" />
                </span>
                <p className="truncate text-[13px] font-medium text-text-primary">
                  {form.resumeUrl.split("/").pop()}
                </p>
              </div>
            ) : (
              <p className="font-mono text-[10px] text-text-muted">No resume uploaded yet.</p>
            )}

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Resume URL</span>
              <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3 py-2.5">
                <UploadIcon size={14} className="shrink-0 text-text-muted" />
                <input
                  type="url"
                  value={form.resumeUrl}
                  onChange={set("resumeUrl")}
                  placeholder="https://ik.imagekit.io/… (PDF URL)"
                  className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                />
              </div>
            </label>
            {form.resumeUrl ? (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, resumeUrl: "" }))}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary"
              >
                <TrashIcon size={12} />
                Remove
              </button>
            ) : null}
            <p className="font-mono text-[10px] text-text-muted">
              A Resume button appears in the profile header while a file is set.
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">GitHub heatmap</p>
              <p className={fieldLabel}>Cached 6–12 h</p>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-[13px] font-medium text-text-primary">Show heatmap</p>
                <p className="font-mono text-[10px] text-text-muted">
                  Hidden automatically if the fetch fails
                </p>
              </div>
              <Toggle
                checked={heatmapVisible}
                label="Show GitHub heatmap"
                onChange={handleHeatmapToggle}
                disabled={!heatmapSection}
              />
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>GitHub username</span>
              <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3 py-2.5">
                <ArrowUpRightIcon size={14} className="shrink-0 text-text-muted" />
                <input
                  value={form.githubUsername}
                  onChange={set("githubUsername")}
                  placeholder="username"
                  className="w-full bg-transparent font-mono text-xs text-text-primary placeholder:text-text-muted outline-none"
                />
              </div>
            </label>
          </div>

          <div className={cardClass}>
            <p className="font-serif text-[22px] text-text-primary">Save</p>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-md border border-cta-bg bg-cta-bg px-3 py-[11px] font-mono text-[10px] font-bold uppercase text-cta-text disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={discard}
              className="flex w-full items-center justify-center rounded-lg border border-dashed border-border-default px-3 py-2.5 font-mono text-[10px] font-bold uppercase text-text-primary"
            >
              Discard changes
            </button>
            <p className="font-mono text-[10px] text-text-muted">
              {saved ? "Saved · live on the public site." : "Changes go live on the public site straight away."}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
