import SectionDivider from "@/components/ui/SectionDivider";

// Matches Button's "primary" variant classes (src/components/ui/Button.jsx)
// as a mailto link — this CTA opens the contact modal once step 5 builds
// it; until then it degrades to mailto, like the contact row's "Message
// me" cell (docs/DECISIONS.md).
const ctaLinkClass =
  "rounded-pill bg-cta-bg border border-cta-bg text-cta-text px-8 py-3.5 text-sm font-medium tracking-[0.005em] hover:bg-text-primary";

/**
 * "Let's talk" CTA + footer (Figma 5:6258 → 5:6261). Grouped with the
 * footer since Figma's own "Connect and footer" frame treats them as
 * one editorial column with no divider between them.
 * @param {{
 *   heading?: string, subtext?: string, email?: string,
 *   footerText?: string,
 * }} props
 */
export default function LetsTalkSection({ heading, subtext, email, footerText }) {
  return (
    <section id="lets-talk" aria-labelledby="lets-talk-heading">
      <SectionDivider />
      <div className="flex flex-col items-center gap-6 px-6 py-14 text-center">
        <div className="flex flex-col gap-3">
          <h2 id="lets-talk-heading" className="font-serif text-[32px] leading-[1.25] text-text-primary">
            {heading ?? "Let's talk."}
          </h2>
          <p className="text-[14.5px] leading-[1.63] text-text-secondary">
            {subtext ?? "If you have a project, a question, or just want to say hello."}
          </p>
        </div>
        {email ? (
          <a href={`mailto:${email}`} className={ctaLinkClass}>
            Let&apos;s Talk →
          </a>
        ) : null}
        <p className="font-mono text-[10px] text-text-muted">
          {footerText ?? `© ${new Date().getFullYear()}`}
        </p>
      </div>
    </section>
  );
}
