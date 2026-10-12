import SectionDivider from "@/components/ui/SectionDivider";
import LetsTalkTrigger from "@/components/public/LetsTalkTrigger";

/**
 * "Let's talk" CTA + footer (Figma 5:6258 → 5:6261). Grouped with the
 * footer since Figma's own "Connect and footer" frame treats them as
 * one editorial column with no divider between them. The CTA always
 * opens the contact modal (step 5) — it no longer needs a social email
 * on file, since the modal emails siteSettings.notificationEmail, not
 * profile.socialLinks.email (docs/DECISIONS.md).
 * @param {{ heading?: string, subtext?: string, footerText?: string }} props
 */
export default function LetsTalkSection({ heading, subtext, footerText }) {
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
        <LetsTalkTrigger />
        <p className="font-mono text-[10px] text-text-muted">
          {footerText ?? `© ${new Date().getFullYear()}`}
        </p>
      </div>
    </section>
  );
}
