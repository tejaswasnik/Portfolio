"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Dropzone from "@/components/admin/Dropzone";
import Toggle from "@/components/ui/Toggle";
import { ArrowUpRightIcon, ImageIcon, PlusIcon } from "@/components/ui/icons.jsx";
import { slugify } from "@/lib/schemas/common.js";
import { projectStatusValues } from "@/lib/schemas/project.js";
import { useActionToast } from "@/lib/hooks/useActionToast.js";
import { useUnsavedChangesWarning } from "@/lib/hooks/useUnsavedChangesWarning.js";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/app/admin/(dashboard)/projects/actions.js";

const fieldLabel = "font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted";
const fieldInput =
  "w-full rounded-lg border border-border-default bg-surface-2 px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus-visible:border-accent";
const cardClass =
  "flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5";

/**
 * Shared New/Edit project form (Figma 66:700 "New project" / 66:9 "Edit
 * project" — identical layout, Edit adds populated values, a Delete card
 * action and a different header/button copy).
 *
 * Cover image and screenshots upload through the shared `Dropzone`
 * (step 9) straight to ImageKit; `coverImage`/`screenshots[].url` are
 * what's actually persisted (`projectSchema` has no fileId field for
 * either, unlike profile's banner/resume — see docs/DECISIONS.md step 9).
 *
 * @param {{
 *   mode: 'create' | 'edit',
 *   project: null | {id: string, name: string, slug: string, shortDescription: string, longDescription: string, coverImage?: string, screenshots?: string[], liveUrl?: string, githubUrl?: string, techIds?: string[], status: string, featured: boolean, published: boolean, order: number, seo?: {title?: string, description?: string, ogImage?: string}},
 *   skills: Array<{id: string, name: string, iconNode?: React.ReactNode}>,
 *   totalCount: number,
 * }} props
 */
export default function ProjectForm({ mode, project, skills, totalCount }) {
  const router = useRouter();

  const [name, setName] = useState(project?.name ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [shortDescription, setShortDescription] = useState(project?.shortDescription ?? "");
  const [longDescription, setLongDescription] = useState(project?.longDescription ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [status, setStatus] = useState(project?.status ?? "ongoing");
  const [techIds, setTechIds] = useState(project?.techIds ?? []);
  const [seoTitle, setSeoTitle] = useState(project?.seo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(project?.seo?.description ?? "");
  const [seoOgImage, setSeoOgImage] = useState(project?.seo?.ogImage ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [published, setPublished] = useState(project?.published ?? false);
  const [orderChoice, setOrderChoice] = useState(
    mode === "edit" ? project.order + 1 : "last",
  );
  const [coverImage, setCoverImage] = useState(project?.coverImage ?? "");
  // No `coverImageFileId`/per-screenshot fileId field exists in
  // projectSchema (docs/ARCHITECTURE.md's data model doesn't list one,
  // unlike profile's bannerFileId/resumeFileId) — fileId here is
  // session-only state so Dropzone can clean up a file it *just*
  // uploaded if replaced again before saving; see docs/DECISIONS.md step 9.
  const [coverImageFileId, setCoverImageFileId] = useState("");
  const [screenshots, setScreenshots] = useState(
    (project?.screenshots ?? []).map((url) => ({ url, fileId: "" })),
  );

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const notify = useActionToast();
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Unsaved-changes warning (UX-02): snapshot every field the form can
  // edit and compare against what was last saved (or the initial
  // values, for a new project). `lastSavedSnapshot` is updated after a
  // successful edit-mode save so a subsequent `router.refresh()`
  // doesn't leave the warning stuck on for a form the user just saved.
  const currentSnapshot = JSON.stringify({
    name,
    slug,
    shortDescription,
    longDescription,
    liveUrl,
    githubUrl,
    status,
    techIds,
    seoTitle,
    seoDescription,
    seoOgImage,
    featured,
    published,
    orderChoice,
    coverImage,
    screenshots,
  });
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(currentSnapshot);
  const isDirty = currentSnapshot !== lastSavedSnapshot;
  useUnsavedChangesWarning(isDirty);

  // `totalCount` is every *other* project (edit mode excludes self), so
  // this project can occupy any position from 1 up to totalCount + 1.
  const orderOptions = Array.from({ length: totalCount + 1 }, (_, i) => i + 1);
  const availableSkills = skills.filter((skill) => !techIds.includes(skill.id));

  function handleNameChange(value) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function addScreenshotSlot() {
    setScreenshots((current) => [...current, { url: "", fileId: "" }]);
  }

  function setScreenshotAt(index, next) {
    setScreenshots((current) => current.map((s, i) => (i === index ? next : s)));
  }

  function removeScreenshot(index) {
    setScreenshots((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSubmitting(true);

    const payload = {
      name,
      slug,
      shortDescription,
      longDescription,
      coverImage,
      screenshots: screenshots.map((s) => s.url.trim()).filter(Boolean),
      liveUrl,
      githubUrl,
      techIds,
      status,
      featured,
      published,
      orderChoice,
      seo: { title: seoTitle, description: seoDescription, ogImage: seoOgImage },
    };

    const result =
      mode === "create"
        ? await createProject(payload)
        : await updateProject({ ...payload, id: project.id });

    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error || "Something went wrong. Please try again.");
      setFieldErrors(result.fieldErrors || {});
      notify(result);
      return;
    }

    notify(result, mode === "create" ? "Project created" : "Changes saved");
    setLastSavedSnapshot(currentSnapshot);
    if (mode === "create") {
      router.push(`/admin/projects/${result.id}`);
    } else {
      router.refresh();
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteProject({ id: project.id });
    if (result.ok) {
      notify(result, "Project deleted");
      router.push("/admin/projects");
    } else {
      setDeleting(false);
      setDeleteOpen(false);
      setFormError(result.error || "Could not delete this project.");
      notify(result);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-20 lg:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[28px] tracking-[-0.95px] text-text-primary sm:text-[38px]">
            {mode === "create" ? "New project" : "Edit project"}
          </h1>
          <p className="font-mono text-[11px] text-text-muted">
            {mode === "create"
              ? "Draft · not saved yet · slug is generated from the name"
              : `/projects/${project.slug}`}
          </p>
        </div>
        {/* Desktop-only: the mobile equivalent is the sticky bottom save bar below. */}
        <div className="hidden items-start gap-2 lg:flex">
          {mode === "edit" ? (
            <a
              href={`/projects/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary"
            >
              <ArrowUpRightIcon size={12} />
              View page
            </a>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-md border border-cta-bg bg-cta-bg px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-cta-text disabled:opacity-50"
          >
            {mode === "create" ? (
              <>
                <PlusIcon size={12} />
                {submitting ? "Creating…" : "Create project"}
              </>
            ) : submitting ? (
              "Saving…"
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>

      {/*
        Sticky bottom save bar, mobile only (design.md §23). A second
        type="submit" button inside the same <form> as the desktop one
        above — only one is ever visible at a given width, so there's no
        double-submit risk.
      */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-end gap-2 border-t border-border-subtle bg-surface-1 p-4 lg:hidden">
        {mode === "edit" ? (
          <a
            href={`/projects/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 font-mono text-[10px] font-bold uppercase text-text-primary"
          >
            View page
          </a>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-cta-bg bg-cta-bg px-3 font-mono text-[10px] font-bold uppercase text-cta-text disabled:opacity-50"
        >
          {mode === "create"
            ? submitting
              ? "Creating…"
              : "Create project"
            : submitting
              ? "Saving…"
              : "Save changes"}
        </button>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-border-default bg-surface-2 px-3 py-2.5 text-[12px] text-text-secondary"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex w-full flex-col-reverse items-start gap-6 lg:flex-row">
        <div className="flex w-full flex-1 flex-col gap-4">
          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Details</p>
              <p className={fieldLabel}>REQUIRED FIELDS: NAME</p>
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Name</span>
              <input
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Project name"
                required
                className={fieldInput}
              />
              {fieldErrors.name ? (
                <span className="text-[11px] text-text-secondary">{fieldErrors.name[0]}</span>
              ) : null}
            </label>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Slug</span>
              <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3 py-2.5">
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlug(event.target.value);
                    setSlugTouched(true);
                  }}
                  placeholder="auto-generated from name"
                  required
                  className="w-full bg-transparent font-mono text-xs text-text-primary outline-none"
                />
                <span className={fieldLabel}>{slugTouched ? "EDITED" : "AUTO"}</span>
              </div>
              {fieldErrors.slug ? (
                <span className="text-[11px] text-text-secondary">{fieldErrors.slug[0]}</span>
              ) : null}
            </label>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Short description</span>
              <textarea
                value={shortDescription}
                onChange={(event) => setShortDescription(event.target.value)}
                placeholder="Shown on project cards (max ~160 characters)"
                rows={3}
                maxLength={160}
                required
                className={fieldInput}
              />
              <span className="font-mono text-[10px] text-text-muted">
                {shortDescription.length} / 160 characters · shown on cards
              </span>
              {fieldErrors.shortDescription ? (
                <span className="text-[11px] text-text-secondary">
                  {fieldErrors.shortDescription[0]}
                </span>
              ) : null}
            </label>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Long description · markdown, shown on the details page</span>
              <textarea
                value={longDescription}
                onChange={(event) => setLongDescription(event.target.value)}
                placeholder="Write the long description in markdown…"
                rows={8}
                required
                className={`${fieldInput} font-mono`}
              />
              {fieldErrors.longDescription ? (
                <span className="text-[11px] text-text-secondary">
                  {fieldErrors.longDescription[0]}
                </span>
              ) : null}
            </label>
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Links &amp; tech</p>
              <p className={fieldLabel}>OPTIONAL</p>
            </div>

            <div className="flex w-full gap-4">
              <label className="flex flex-1 flex-col gap-1.5">
                <span className={fieldLabel}>Live link</span>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(event) => setLiveUrl(event.target.value)}
                  placeholder="https://"
                  className={fieldInput}
                />
                {fieldErrors.liveUrl ? (
                  <span className="text-[11px] text-text-secondary">{fieldErrors.liveUrl[0]}</span>
                ) : null}
              </label>
              <label className="flex flex-1 flex-col gap-1.5">
                <span className={fieldLabel}>GitHub link</span>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(event) => setGithubUrl(event.target.value)}
                  placeholder="https://github.com/"
                  className={fieldInput}
                />
                {fieldErrors.githubUrl ? (
                  <span className="text-[11px] text-text-secondary">{fieldErrors.githubUrl[0]}</span>
                ) : null}
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Status</span>
              <div className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-surface-2 p-[3px]">
                {projectStatusValues.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(value)}
                    aria-pressed={status === value}
                    className={`rounded-[5px] px-2.5 py-[5px] font-mono text-[10px] uppercase ${
                      status === value
                        ? "border border-border-default bg-surface-3 text-text-primary"
                        : "border border-transparent text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2">
              <span className={fieldLabel}>Tech used · pick from skills list</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {techIds.map((id) => {
                  const skill = skills.find((s) => s.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-pill border border-dashed border-border-default py-1 pl-2.5 pr-1.5 font-mono text-[10px] text-text-secondary"
                    >
                      {skill?.iconNode}
                      {skill?.name ?? id}
                      <button
                        type="button"
                        onClick={() => setTechIds((current) => current.filter((t) => t !== id))}
                        aria-label={`Remove ${skill?.name ?? id}`}
                        className="text-text-muted hover:text-text-primary"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
                {availableSkills.length > 0 ? (
                  <select
                    value=""
                    onChange={(event) => {
                      if (event.target.value) {
                        setTechIds((current) => [...current, event.target.value]);
                      }
                    }}
                    aria-label="Add from skills"
                    className="rounded-pill border border-dashed border-border-default bg-transparent py-1 pl-2.5 pr-2 font-mono text-[10px] text-text-secondary outline-none"
                  >
                    <option value="">+ Add from skills</option>
                    {availableSkills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">SEO</p>
              <p className={fieldLabel}>OPTIONAL · FALLS BACK TO COVER IMAGE</p>
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>SEO title</span>
              <input
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                placeholder="Defaults to the project name"
                maxLength={70}
                className={fieldInput}
              />
            </label>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>SEO description</span>
              <textarea
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
                placeholder="Defaults to the short description"
                rows={3}
                maxLength={160}
                className={fieldInput}
              />
            </label>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>OG image</span>
              <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3 py-2.5">
                <ImageIcon size={14} className="shrink-0 text-text-muted" />
                <input
                  type="url"
                  value={seoOgImage}
                  onChange={(event) => setSeoOgImage(event.target.value)}
                  placeholder="Uses the cover image"
                  className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                />
              </div>
            </label>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-[344px]">
          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Publish</p>
              <p className={fieldLabel}>VISIBILITY</p>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-[13px] font-medium text-text-primary">Featured on portfolio</p>
                <p className="font-mono text-[10px] text-text-muted">Shows on home and /projects</p>
              </div>
              <Toggle checked={featured} label="Featured on portfolio" onChange={setFeatured} />
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-[13px] font-medium text-text-primary">Published</p>
                <p className="font-mono text-[10px] text-text-muted">Drafts are hidden everywhere</p>
              </div>
              <Toggle checked={published} label="Published" onChange={setPublished} />
            </div>

            <label className="flex w-full flex-col gap-1.5">
              <span className={fieldLabel}>Display order</span>
              <select
                value={orderChoice}
                onChange={(event) =>
                  setOrderChoice(
                    event.target.value === "last" ? "last" : Number(event.target.value),
                  )
                }
                className={`${fieldInput} font-mono`}
              >
                {orderOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
                <option value="last">Last</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-md border border-cta-bg bg-cta-bg px-3 py-[11px] font-mono text-[10px] font-bold uppercase text-cta-text disabled:opacity-50"
            >
              {mode === "create" ? "Create project" : "Save changes"}
            </button>

            {mode === "edit" ? (
              <Button
                type="button"
                variant="dashed"
                className="w-full"
                onClick={() => setDeleteOpen(true)}
              >
                Delete project
              </Button>
            ) : null}
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Cover image</p>
              <p className={fieldLabel}>IMAGEKIT</p>
            </div>

            <Dropzone
              value={coverImage}
              fileId={coverImageFileId}
              onChange={({ url, fileId }) => {
                setCoverImage(url);
                setCoverImageFileId(fileId);
              }}
              accept="image/*"
              maxSizeMB={5}
              kind="image"
              label="Cover image"
              hint="PNG, JPG or WebP · up to 5 MB"
              folder="/portfolio/projects"
            />
            {fieldErrors.coverImage ? (
              <span className="text-[11px] text-text-secondary">{fieldErrors.coverImage[0]}</span>
            ) : null}
            <p className="font-mono text-[10px] text-text-muted">
              Used on cards and as the default OG image. Stored on ImageKit; the old file is
              deleted on replace.
            </p>
          </div>

          <div className={cardClass}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Screenshots</p>
              <p className={fieldLabel}>
                {screenshots.length === 0 ? "NONE YET" : `${screenshots.length}`}
              </p>
            </div>

            {screenshots.length > 0 ? (
              <div className="flex w-full flex-col gap-3">
                {screenshots.map((screenshot, index) => (
                  <div key={index} className="flex w-full items-start gap-2">
                    <span className="mt-2.5 shrink-0 font-mono text-[10px] text-text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <Dropzone
                        value={screenshot.url}
                        fileId={screenshot.fileId}
                        onChange={({ url, fileId }) => setScreenshotAt(index, { url, fileId })}
                        accept="image/*"
                        maxSizeMB={5}
                        kind="image"
                        label={`Screenshot ${index + 1}`}
                        folder="/portfolio/projects"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      aria-label={`Remove screenshot ${index + 1} slot`}
                      className="mt-2.5 shrink-0 text-text-muted hover:text-text-primary"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={addScreenshotSlot}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-default bg-surface-2 py-2.5 font-mono text-[10px] uppercase text-text-secondary hover:border-accent/50"
            >
              <PlusIcon size={10} />
              Add screenshot
            </button>
            {fieldErrors.screenshots ? (
              <span className="text-[11px] text-text-secondary">{fieldErrors.screenshots[0]}</span>
            ) : null}
          </div>
        </div>
      </div>

      {mode === "edit" ? (
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete project?">
          <p className="mb-6 text-sm text-text-secondary">
            This permanently deletes <strong className="text-text-primary">{project.name}</strong>{" "}
            and removes it from the public site. This can&apos;t be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="dashed" type="button" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="button" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Dialog>
      ) : null}

      <p className="font-mono text-[10px] text-text-muted">
        <Link href="/admin/projects" className="underline hover:text-text-primary">
          ← Back to projects
        </Link>
      </p>
    </form>
  );
}
