"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Dialog from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import PageFrame from "@/components/ui/PageFrame";
import SectionDivider from "@/components/ui/SectionDivider";
import Textarea from "@/components/ui/Textarea";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Toggle from "@/components/ui/Toggle";

function Swatch({ name, varName }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="size-8 rounded-md border border-border-default"
        style={{ background: `var(${varName})` }}
      />
      <span className="font-mono text-xs text-text-secondary">{name}</span>
    </div>
  );
}

const colorTokens = [
  "--bg",
  "--surface-1",
  "--surface-2",
  "--surface-3",
  "--surface-chip",
  "--border-subtle",
  "--border-default",
  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--accent",
];

const heatLevels = ["--heat-0", "--heat-1", "--heat-2", "--heat-3", "--heat-4"];

export default function DevUiPage() {
  const [toggleOn, setToggleOn] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <PageFrame className="min-h-screen px-6 py-10">
      <div className="flex items-center justify-between py-4">
        <h1 className="font-serif text-2xl text-text-primary">
          /dev/ui — component primitives
        </h1>
        <ThemeToggle />
      </div>

      <SectionDivider />
      <section className="flex flex-col gap-4 py-8">
        <h2 className="font-serif text-xl text-text-primary">Color tokens</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {colorTokens.map((t) => (
            <Swatch key={t} name={t} varName={t} />
          ))}
        </div>
        <div className="flex gap-2">
          {heatLevels.map((t) => (
            <span
              key={t}
              className="size-6 rounded-xs"
              style={{ background: `var(${t})` }}
              title={t}
            />
          ))}
        </div>
      </section>

      <SectionDivider />
      <section className="flex flex-col gap-4 py-8">
        <h2 className="font-serif text-xl text-text-primary">Type</h2>
        <p className="font-serif text-3xl text-text-primary">
          Instrument Serif — headings
        </p>
        <p className="font-sans text-sm text-text-secondary">
          Inter — body copy, 14.5/24 in the real design
        </p>
        <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
          JetBrains Mono — annotations, buttons, labels
        </p>
      </section>

      <SectionDivider />
      <section className="flex flex-col gap-4 py-8">
        <h2 className="font-serif text-xl text-text-primary">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Let&apos;s Talk →</Button>
          <Button variant="dashed">View details →</Button>
          <Button variant="icon" aria-label="GitHub">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <circle cx="7" cy="7" r="6" stroke="currentColor" fill="none" />
            </svg>
          </Button>
        </div>
      </section>

      <SectionDivider />
      <section className="flex flex-col gap-4 py-8">
        <h2 className="font-serif text-xl text-text-primary">Chips</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Chip variant="tech">Next.js</Chip>
          <Chip variant="tech">TypeScript</Chip>
          <Chip variant="skill">React</Chip>
          <Chip variant="skill">PostgreSQL</Chip>
        </div>
      </section>

      <SectionDivider />
      <section className="flex flex-col gap-4 py-8">
        <h2 className="font-serif text-xl text-text-primary">Inputs</h2>
        <div className="flex max-w-sm flex-col gap-4">
          <Input label="Name" placeholder="Your name" />
          <Textarea label="Message" placeholder="Write your message…" />
        </div>
      </section>

      <SectionDivider />
      <section className="flex flex-col gap-4 py-8">
        <h2 className="font-serif text-xl text-text-primary">Toggle</h2>
        <div className="flex items-center gap-3">
          <Toggle
            checked={toggleOn}
            onChange={setToggleOn}
            label="Example toggle"
          />
          <span className="font-mono text-xs text-text-secondary">
            {toggleOn ? "on" : "off"}
          </span>
        </div>
      </section>

      <SectionDivider />
      <section className="flex flex-col gap-4 py-8">
        <h2 className="font-serif text-xl text-text-primary">Dialog</h2>
        <Button variant="dashed" onClick={() => setDialogOpen(true)}>
          Open dialog →
        </Button>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Let's talk."
        >
          <p className="mb-6 text-sm text-text-secondary">
            Example dialog body — same chrome as the contact form modal.
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setDialogOpen(false)}
          >
            Close
          </Button>
        </Dialog>
      </section>
    </PageFrame>
  );
}
