import SectionDivider from "@/components/ui/SectionDivider";
import Chip from "@/components/ui/Chip";
import SkillIcon from "@/components/ui/SkillIcon";
import { resolveSkillIcon } from "@/lib/icons/resolveSkillIcon.js";

/**
 * Tech stack chips (Figma 5:5766 → 5:5769). Figma's own heading is 30px
 * serif, but CLAUDE.md explicitly says "'Stack' matches the others" —
 * 24px, like About/Projects/Activity — so that convention wins here
 * (docs/DECISIONS.md).
 *
 * Icons render in their real brand colour (`SkillIcon`'s default —
 * overriding design.md §20's original "monochrome" call per user
 * feedback, see docs/DECISIONS.md "fixes round 2").
 * @param {{ skills: Array<{ id: string, name: string, iconSlug?: string, iconUrl?: string }> }} props
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
            <Chip key={skill.id} variant="skill" icon={<SkillIcon {...resolveSkillIcon(skill)} />}>
              {skill.name}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
}
