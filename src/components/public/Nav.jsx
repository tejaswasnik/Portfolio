"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import TransitionLink from "@/components/public/transitions/TransitionLink.jsx";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { SPRING } from "@/lib/motion/tokens.js";

/**
 * Site nav (Figma 5:5316): "TW." wordmark, Home/Projects links, theme
 * toggle. No Notes link — PRD hard rule. Deliberately literal "TW."
 * (docs/figma-map.md "Deliberate differences": design.md's "YN." is
 * superseded).
 *
 * Hoisted into `(public)/layout.js` (not rendered per-page anymore,
 * and no longer takes an `active` prop) for two reasons: `usePathname()`
 * derives the active item directly, and — the actual reason it has to
 * live there — the A7 sliding active-pill only works at all if this
 * component survives a route change, since Motion's `layoutId` FLIPs
 * between two renders of the *same* mounted component, not across an
 * unmount/remount. A side effect: Nav now also sits outside
 * `TransitionProvider`'s `data-transition-stagger` content (that lives
 * inside `PageFrame`'s `<main>`, one level further in), so the page
 * transition's strike-out/draw-in never touches it — it stays visibly
 * still across navigations, which happens to be the right call for a
 * nav bar regardless.
 */
export default function Nav() {
  const pathname = usePathname();
  const active = pathname === "/" ? "home" : pathname.startsWith("/projects") ? "projects" : null;

  return (
    <nav
      aria-label="Primary"
      className="relative z-10 mx-auto flex h-16 w-full max-w-column items-center justify-between px-6"
    >
      <TransitionLink
        href="/"
        className="font-serif text-xl tracking-[0.5px] text-text-primary"
      >
        TW.
      </TransitionLink>
      <div className="flex items-center gap-6">
        <TransitionLink
          href="/"
          className={`link-underline relative font-mono text-[11px] ${active === "home" ? "text-text-primary" : "text-text-muted transition-colors hover:text-text-primary"}`}
        >
          {active === "home" ? (
            <motion.span
              data-nav-pill
              layoutId="nav-pill"
              transition={SPRING.layout}
              className="absolute -inset-x-1.5 -inset-y-1 -z-10 rounded-full bg-surface-2"
            />
          ) : null}
          Home
        </TransitionLink>
        <TransitionLink
          href="/projects"
          className={`link-underline relative font-mono text-[11px] ${active === "projects" ? "text-text-primary" : "text-text-muted transition-colors hover:text-text-primary"}`}
        >
          {active === "projects" ? (
            <motion.span
              data-nav-pill
              layoutId="nav-pill"
              transition={SPRING.layout}
              className="absolute -inset-x-1.5 -inset-y-1 -z-10 rounded-full bg-surface-2"
            />
          ) : null}
          Projects
        </TransitionLink>
        <span aria-hidden="true" className="h-4 w-px bg-border-subtle" />
        <ThemeToggle />
      </div>
    </nav>
  );
}
