import TransitionLink from "@/components/public/transitions/TransitionLink.jsx";
import ThemeToggle from "@/components/ui/ThemeToggle";

/**
 * Site nav (Figma 5:5316): "TW." wordmark, Home/Projects links, theme
 * toggle. No Notes link — PRD hard rule. Deliberately literal "TW."
 * (docs/figma-map.md "Deliberate differences": design.md's "YN." is
 * superseded).
 * @param {{ active: 'home' | 'projects' }} props
 */
export default function Nav({ active }) {
  return (
    <div className="flex h-16 w-full items-center justify-between px-6">
      <TransitionLink
        href="/"
        className="font-serif text-xl tracking-[0.5px] text-text-primary"
      >
        TW.
      </TransitionLink>
      <div className="flex items-center gap-6">
        <TransitionLink
          href="/"
          className={`font-mono text-[11px] ${active === "home" ? "text-text-primary" : "text-text-muted transition-colors hover:text-text-primary"}`}
        >
          Home
        </TransitionLink>
        <TransitionLink
          href="/projects"
          className={`font-mono text-[11px] ${active === "projects" ? "text-text-primary" : "text-text-muted transition-colors hover:text-text-primary"}`}
        >
          Projects
        </TransitionLink>
        <span aria-hidden="true" className="h-4 w-px bg-border-subtle" />
        <ThemeToggle />
      </div>
    </div>
  );
}
