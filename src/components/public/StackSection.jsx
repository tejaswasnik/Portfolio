import SectionDivider from "@/components/ui/SectionDivider";
import Chip from "@/components/ui/Chip";

/**
 * Tech stack chips (Figma 5:5766 → 5:5769). Figma's own heading is 30px
 * serif, but CLAUDE.md explicitly says "'Stack' matches the others" —
 * 24px, like About/Projects/Activity — so that convention wins here
 * (docs/DECISIONS.md).
 * @param {{ skills: Array<{ id: string, name: string, icon?: string }> }} props
 */
export default function StackSection({ skills }) {
  if (skills.length === 0) return null;

  return (
    <section id="stack" aria-labelledby="stack-heading">
      <SectionDivider />
      <div className="flex flex-col gap-4 p-6">
        <h2
          id="stack-heading"
          className="font-serif text-2xl tracking-[0.6px] text-text-primary"
        >
          Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Chip
              key={skill.id}
              variant="skill"
              icon={
                // skill.icon may be an ImageKit URL (step 9) or a yet-undefined
                // icon-library key (step 4); only render it as an <img> once
                // it's actually a URL.
                /^(https?:)?\//.test(skill.icon ?? "") ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote URL, not a static import.
                  <img src={skill.icon} alt="" className="size-3.5 rounded" />
                ) : undefined
              }
            >
              {skill.name}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
}
