"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { ArchiveIcon, TrashIcon } from "@/components/ui/icons.jsx";
import {
  deleteMessage,
  setMessageArchived,
} from "@/app/admin/(dashboard)/messages/actions.js";

/** "Today HH:MM" / "Yesterday" / "Oct 10" — matches Figma's received-date copy. */
function formatReceived(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Today ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  }
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

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
 * Admin Messages inbox table (Figma 70:7): unread dot, avatar, subject +
 * message preview, a status flag (email failed/archived), received date,
 * and quick archive/delete actions. Row click opens the detail screen.
 * @param {{ messages: Array<{id: string, name: string, email: string, subject: string, message: string, read: boolean, archived: boolean, emailFailed: boolean, createdAt: string}> }} props
 */
export default function MessagesTable({ messages }) {
  const router = useRouter();
  const [items, setItems] = useState(messages);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  async function handleArchiveToggle(event, message) {
    event.preventDefault();
    event.stopPropagation();
    const next = !message.archived;
    setItems((current) =>
      current.map((m) => (m.id === message.id ? { ...m, archived: next } : m)),
    );
    const result = await setMessageArchived({ id: message.id, value: next });
    if (!result.ok) {
      setItems((current) =>
        current.map((m) => (m.id === message.id ? { ...m, archived: !next } : m)),
      );
      setError(result.error || "Something went wrong.");
    } else {
      router.refresh();
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const result = await deleteMessage({ id: deleteTarget.id });
    if (result.ok) {
      setItems((current) => current.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } else {
      setError(result.error || "Could not delete this message.");
    }
  }

  return (
    <>
      {error ? (
        <p role="alert" className="text-[11px] text-text-secondary">
          {error}
        </p>
      ) : null}

      <div className="flex w-full flex-col items-start rounded-xl border border-border-subtle bg-surface-1 px-5 pb-1 pt-1">
        <div className="flex w-full items-center gap-4 border-b border-border-subtle py-3">
          <div className="w-2" />
          <div className="w-9" />
          <div className="w-[190px] font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
            From
          </div>
          <div className="flex-1 font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
            Message
          </div>
          <div className="w-24 font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
            Flag
          </div>
          <div className="w-[84px] font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
            Received
          </div>
          <div className="w-16" />
        </div>

        {items.length === 0 ? (
          <p className="w-full py-10 text-center text-sm text-text-muted">
            No messages match these filters.
          </p>
        ) : (
          items.map((message) => (
            <Link
              key={message.id}
              href={`/admin/messages/${message.id}`}
              className={`flex w-full items-center gap-4 border-b border-border-subtle py-3.5 last:border-b-0 hover:bg-surface-2 ${
                message.archived ? "opacity-60" : ""
              }`}
            >
              <div className="flex w-2 items-center">
                {!message.read ? (
                  <span className="size-1.5 rounded-full bg-accent" aria-label="Unread" />
                ) : null}
              </div>
              <div className="w-9">
                <span className="flex size-9 items-center justify-center rounded-full border border-border-default bg-surface-3 font-serif text-[13px] text-accent">
                  {initials(message.name)}
                </span>
              </div>
              <div className="w-[190px]">
                <p
                  className={`text-[13px] ${message.read ? "font-medium text-text-secondary" : "font-semibold text-text-primary"}`}
                >
                  {message.name}
                </p>
                <p className="font-mono text-[10px] text-text-muted">{message.email}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-[13px] ${message.read ? "font-medium text-text-secondary" : "font-semibold text-text-primary"}`}
                >
                  {message.subject || "(no subject)"}
                </p>
                <p className="truncate text-[12px] text-text-muted">{message.message}</p>
              </div>
              <div className="w-24">
                {message.emailFailed ? (
                  <span className="inline-flex items-center rounded-[3px] border border-border-default bg-surface-3 px-2 py-1 font-mono text-[8px] font-bold uppercase text-accent">
                    Email failed
                  </span>
                ) : message.archived ? (
                  <span className="inline-flex items-center rounded-[3px] border border-border-default bg-surface-3 px-2 py-1 font-mono text-[8px] font-bold uppercase text-text-muted">
                    Archived
                  </span>
                ) : null}
              </div>
              <div className="w-[84px] font-mono text-[10px] text-text-secondary">
                {formatReceived(message.createdAt)}
              </div>
              <div className="flex w-16 items-center gap-1.5">
                <button
                  type="button"
                  aria-label={message.archived ? `Unarchive ${message.name}` : `Archive ${message.name}`}
                  onClick={(event) => handleArchiveToggle(event, message)}
                  className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary hover:border-border-hover"
                >
                  <ArchiveIcon size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete message from ${message.name}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setDeleteTarget(message);
                  }}
                  className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary hover:border-border-hover"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </Link>
          ))
        )}
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete message?"
      >
        <p className="mb-6 text-sm text-text-secondary">
          This permanently deletes the message from{" "}
          <strong className="text-text-primary">{deleteTarget?.name}</strong>. This can&apos;t be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="dashed" type="button" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </>
  );
}
