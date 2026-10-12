import SectionDivider from "@/components/ui/SectionDivider";
import { CoffeeIcon } from "@/components/ui/icons";

/**
 * About section (Figma 5:5635 → Editorial column 5:5638). Heading is
 * 24px serif per CLAUDE.md's section-title convention.
 * @param {{ profile: import('@/lib/schemas/profile').profileSchema._type | null }} props
 */
export default function AboutSection({ profile }) {
  const paragraphs = (profile?.about ?? "").split(/\n{2,}/).filter(Boolean);

  return (
    <section id="about" aria-labelledby="about-heading">
      <SectionDivider />
      <div className="flex flex-col gap-6 p-6">
        <h2
          id="about-heading"
          className="font-serif text-2xl tracking-[0.6px] text-text-primary"
        >
          About
        </h2>
        <div className="flex flex-col gap-3 text-[14.5px] leading-[1.625] text-text-secondary">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p>Nothing written yet.</p>
          )}
        </div>
        {profile?.footnote ? (
          <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
            <CoffeeIcon size={14} />
            <p>{profile.footnote}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
