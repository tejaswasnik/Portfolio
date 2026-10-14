import SectionDivider from "@/components/ui/SectionDivider";
import LetsTalkTrigger from "@/components/public/LetsTalkTrigger";
import Reveal from "@/components/motion/Reveal.jsx";

/**
 * "Let's talk" CTA + footer (Figma 5:6258 → 5:6261). Grouped with the
 * footer since Figma's own "Connect and footer" frame treats them as
 * one editorial column with no divider between them. The CTA always
 * opens the contact modal (step 5) — it no longer needs a social email
 * on file, since the modal emails siteSettings.notificationEmail, not
 * profile.socialLinks.email (docs/DECISIONS.md).
 *
 * Heading and the subtext/CTA/footer block are separate `Reveal.Item`s
 * (A8 Task 5 Step 4), staggered 60ms apart by the page-level
 * `<Reveal stagger>` wrapper.
 * @param {{ heading?: string, subtext?: string, footerText?: string }} props
 */
export default function LetsTalkSection({ heading, subtext, footerText }) {
  return (
    <section id="lets-talk" aria-labelledby="lets-talk-heading">
      <SectionDivider />
      <div className="flex flex-col items-center gap-6 px-6 py-14 text-center">
        <Reveal.Item className="flex flex-col gap-3">
          <h2 id="lets-talk-heading" className="font-serif text-[32px] leading-[1.25] text-text-primary">
            {heading ?? "Let's talk."}
          </h2>
          <p className="text-[14.5px] leading-[1.63] text-text-secondary">
            {subtext ?? "If you have a project, a question, or just want to say hello."}
          </p>
        </Reveal.Item>
        <Reveal.Item className="flex flex-col items-center gap-6">
          <LetsTalkTrigger />
          <p className="font-mono text-[10px] text-text-muted">
            {footerText ?? `© ${new Date().getFullYear()}`}
          </p>
        </Reveal.Item>
      </div>
    </section>
  );
}
