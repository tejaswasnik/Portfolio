"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import {
  ArchiveIcon,
  BackIcon,
  CheckIcon,
  MailIcon,
  ReplyIcon,
  TrashIcon,
} from "@/components/ui/icons.jsx";
import {
  deleteMessage,
  retryMessageEmail,
  setMessageArchived,
  setMessageRead,
} from "@/app/admin/(dashboard)/messages/actions.js";

function initials(name) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("") || "—"
  );
}

/**
 * Admin Message detail (Figma 70:720). The "Delivery" and "Sender"
 * cards only show what's actually tracked — real `createdAt`/
 * `emailFailed`/`ipHash` fields — rather than Figma's sample Country/
 * Device/Rate-limit rows, which this app doesn't capture per message
 * (that's step 11 analytics' event-level data, not `messageSchema`).
 * See docs/DECISIONS.md step 10.
 * @param {{ message: {id: string, name: string, email: string, subject: string, message: string, read: boolean, archived: boolean, emailFailed: boolean, ipHash: string, createdAt: string} }} props
 */
export default function MessageDetail({ message }) {
  const router = useRouter();
  const [read, setRead] = useState(message.read);
  const [archived, setArchived] = useState(message.archived);
  const [emailFailed, setEmailFailed] = useState(message.emailFailed);
  const [retrying, setRetrying] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState("");

  const receivedAt = new Date(message.createdAt).toLocaleString([], {
    weekday: undefined,
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });

  const mailtoHref = `mailto:${message.email}?subject=${encodeURIComponent(
    message.subject ? `Re: ${message.subject}` : "Re: your message",
  )}`;

  async function toggleRead() {
    const next = !read;
    setRead(next);
    const result = await setMessageRead({ id: message.id, value: next });
    if (!result.ok) {
      setRead(!next);
      setError(result.error || "Something went wrong.");
    } else {
      router.refresh();
    }
  }

  async function toggleArchived() {
    const next = !archived;
    setArchived(next);
    const result = await setMessageArchived({ id: message.id, value: next });
    if (!result.ok) {
      setArchived(!next);
      setError(result.error || "Something went wrong.");
    } else {
      router.refresh();
    }
  }

  async function handleRetry() {
    setRetrying(true);
    setError("");
    const result = await retryMessageEmail({ id: message.id });
    setRetrying(false);
    if (result.ok) {
      setEmailFailed(false);
      router.refresh();
    } else {
      setError(result.error || "The retry failed.");
    }
  }

  async function handleDelete() {
    const result = await deleteMessage({ id: message.id });
    if (result.ok) {
      router.push("/admin/messages");
    } else {
      setDeleteOpen(false);
      setError(result.error || "Could not delete this message.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[28px] tracking-[-0.95px] text-text-primary sm:text-[38px]">Message</h1>
          <p className="font-mono text-[11px] text-text-muted">
            From {message.name} · received {receivedAt}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Link
            href="/admin/messages"
            className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary"
          >
            <BackIcon size={12} />
            Back to inbox
          </Link>
          <a
            href={mailtoHref}
            className="flex items-center gap-1.5 rounded-md border border-cta-bg bg-cta-bg px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-cta-text"
          >
            <ReplyIcon size={12} />
            Reply
          </a>
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

      <div className="flex w-full flex-col-reverse items-start gap-6 lg:flex-row">
        <div className="flex-1 rounded-xl border border-border-subtle bg-surface-1 p-6">
          <div className="flex w-full items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full border border-border-default bg-surface-3 font-serif text-lg text-accent">
              {initials(message.name)}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary">{message.name}</p>
              <p className="font-mono text-[11px] text-text-muted">{message.email}</p>
            </div>
            {!read ? (
              <span className="rounded-[3px] border border-border-default bg-surface-3 px-2 py-1 font-mono text-[8px] font-bold uppercase text-accent">
                Unread
              </span>
            ) : null}
          </div>

          <div className="my-5 h-px w-full bg-border-subtle" />

          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
            Subject
          </p>
          <p className="mb-5 font-serif text-[28px] leading-[34px] text-text-primary">
            {message.subject || "(no subject)"}
          </p>

          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
            Message
          </p>
          <div className="flex flex-col gap-3 text-[14.5px] leading-[24px] text-text-secondary">
            {message.message.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-[344px]">
          <div className="flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
            <p className="font-serif text-[22px] text-text-primary">Actions</p>
            <a
              href={mailtoHref}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-cta-bg bg-cta-bg px-3 py-[11px] font-mono text-[10px] font-bold uppercase text-cta-text"
            >
              <ReplyIcon size={12} />
              Reply by email
            </a>
            <button
              type="button"
              onClick={toggleRead}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-2.5 font-mono text-[10px] font-bold uppercase text-text-primary"
            >
              <MailIcon size={12} />
              {read ? "Mark as unread" : "Mark as read"}
            </button>
            <button
              type="button"
              onClick={toggleArchived}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-2.5 font-mono text-[10px] font-bold uppercase text-text-primary"
            >
              <ArchiveIcon size={12} />
              {archived ? "Unarchive" : "Archive"}
            </button>
            <Button variant="dashed" className="w-full" onClick={() => setDeleteOpen(true)}>
              <TrashIcon size={12} />
              Delete message
            </Button>
            <p className="font-mono text-[10px] text-text-muted">
              Reply opens your mail app with the sender and subject filled in.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Delivery</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
                System
              </p>
            </div>
            <div className="flex w-full items-center gap-2.5">
              <CheckIcon size={14} className="shrink-0 text-accent" />
              <p className="flex-1 text-[13px] text-text-primary">Saved to database</p>
              <p className="font-mono text-[10px] text-text-muted">{receivedAt}</p>
            </div>
            <div className="flex w-full items-center gap-2.5">
              <CheckIcon
                size={14}
                className={`shrink-0 ${emailFailed ? "text-text-muted" : "text-accent"}`}
              />
              <p className="flex-1 text-[13px] text-text-primary">
                {emailFailed ? "Admin email notification failed" : "Admin email notification sent"}
              </p>
              {emailFailed ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={retrying}
                  className="font-mono text-[9px] font-bold uppercase text-accent hover:underline disabled:opacity-50"
                >
                  {retrying ? "Retrying…" : "Retry"}
                </button>
              ) : null}
            </div>
            <div className="flex w-full items-center gap-2.5">
              <CheckIcon size={14} className="shrink-0 text-accent" />
              <p className="flex-1 text-[13px] text-text-primary">Honeypot</p>
              <p className="font-mono text-[10px] text-text-muted">Clear</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 rounded-xl border border-border-subtle bg-surface-1 p-5">
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-[22px] text-text-primary">Sender</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
                Privacy
              </p>
            </div>
            <div className="flex w-full items-center justify-between font-mono">
              <p className="text-[9px] uppercase tracking-[0.72px] text-text-muted">
                Visitor hash
              </p>
              <p className="text-[10px] text-text-secondary">
                {message.ipHash.slice(0, 4)}…{message.ipHash.slice(-4)}
              </p>
            </div>
            <p className="font-mono text-[10px] text-text-muted">
              Raw IP addresses are never stored. The hash rotates daily.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete message?">
        <p className="mb-6 text-sm text-text-secondary">
          This permanently deletes the message from{" "}
          <strong className="text-text-primary">{message.name}</strong>. This can&apos;t be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="dashed" type="button" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
