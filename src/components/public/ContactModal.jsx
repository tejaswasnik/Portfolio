"use client";

import { cloneElement, useId, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { contactFormSchema, honeypotFieldName } from "@/lib/schemas/message.js";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "", [honeypotFieldName]: "" };

/**
 * The contact modal (Figma 74:1105 form / 74:1492 sent state). Swaps its
 * own content between the form and the "sent" copy on success, rather
 * than closing and reopening the Dialog.
 * @param {{ open: boolean, onClose: () => void }} props
 */
export default function ContactModal({ open, onClose }) {
  const [fields, setFields] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | sent
  const errorId = useId();

  function handleClose() {
    onClose();
    // Reset once the close animation/transition would be done; there is
    // none here, so reset immediately after the Dialog unmounts.
    setFields(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setStatus("idle");
  }

  function updateField(name) {
    return (event) => setFields((prev) => ({ ...prev, [name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const parsed = contactFormSchema.safeParse(fields);
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setFieldErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("idle");
        if (json.fieldErrors) setFieldErrors(json.fieldErrors);
        setFormError(json.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("idle");
      setFormError("Something went wrong. Please check your connection and try again.");
    }
  }

  if (status === "sent") {
    return (
      <Dialog open={open} onClose={handleClose} title="Message sent.">
        <div key="sent" className="animate-content-in flex flex-col gap-6">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full border border-border-default bg-surface-3 text-xl text-accent"
          >
            ✓
          </span>
          <p className="text-sm leading-[1.6] text-text-secondary">
            Thanks for reaching out. I&apos;ll read your message and get back to you by email as
            soon as I can.
          </p>
          <Button variant="dashed" onClick={handleClose} className="self-start">
            Close
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Let's talk.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <p className="text-sm leading-[1.6] text-text-secondary">
          Have a project, a question, or just want to say hello? Send a note and I&apos;ll reply
          by email.
        </p>

        {/* Honeypot: real visitors never see or fill this in. */}
        <div aria-hidden="true" className="absolute left-[-9999px]">
          <label htmlFor={`${errorId}-company`}>Company</label>
          <input
            id={`${errorId}-company`}
            name={honeypotFieldName}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={fields[honeypotFieldName]}
            onChange={updateField(honeypotFieldName)}
          />
        </div>

        <Field label="Name" error={fieldErrors.name?.[0]}>
          <Input
            placeholder="Your name"
            value={fields.name}
            onChange={updateField("name")}
            aria-invalid={Boolean(fieldErrors.name)}
            required
          />
        </Field>

        <Field label="Email" error={fieldErrors.email?.[0]}>
          <Input
            type="email"
            placeholder="you@example.com"
            value={fields.email}
            onChange={updateField("email")}
            aria-invalid={Boolean(fieldErrors.email)}
            required
          />
        </Field>

        <Field label="Subject (optional)" error={fieldErrors.subject?.[0]}>
          <Input
            placeholder="What is this about?"
            value={fields.subject}
            onChange={updateField("subject")}
          />
        </Field>

        <Field label="Message" error={fieldErrors.message?.[0]}>
          <Textarea
            placeholder="Write your message…"
            value={fields.message}
            onChange={updateField("message")}
            aria-invalid={Boolean(fieldErrors.message)}
            required
          />
        </Field>

        {formError ? (
          <p role="alert" className="text-sm text-red-400">
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={status === "submitting"} className="w-full">
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>

        <p className="font-mono text-[10px] text-text-muted">
          Protected by a hidden honeypot field and rate limiting.
        </p>
      </form>
    </Dialog>
  );
}

/**
 * A labeled field wrapper that surfaces a per-field error message. Wraps
 * the input in a real `<label>` (matching Input/Textarea's own implicit-
 * label convention) and also wires an explicit `aria-describedby` to the
 * error paragraph, so assistive tech announces the error either way.
 */
function Field({ label, error, children }) {
  const errorId = useId();
  const input = cloneElement(children, {
    "aria-describedby": error ? errorId : undefined,
  });

  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      {input}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </label>
  );
}
