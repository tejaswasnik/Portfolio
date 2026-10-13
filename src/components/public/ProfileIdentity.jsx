"use client";

import { motion } from "motion/react";
import TrackedLink from "@/components/public/TrackedLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import TextReveal from "@/components/motion/TextReveal.jsx";
import RoleRotator from "@/components/motion/RoleRotator.jsx";
import { withImageKitTransform } from "@/lib/imagekit/url.js";
import { useHeroPlayed } from "@/hooks/useHeroPlayed.js";

// Matches Button's "dashed" variant classes (src/components/ui/Button.jsx)
// without reaching for an <a> rendered through a <button>-only component —
// step 1's primitives are out of scope for this step (docs/DECISIONS.md).
const dashedLinkClass =
  "press arrow-nudge inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-border-default px-3.5 py-2.5 text-text-primary text-[11px] font-bold font-mono uppercase transition-colors hover:border-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Identity row — avatar, name, tagline, location, resume (Figma
 * 5:5613). A toggleable section ("profile") separate from Banner.
 * Rest of the hero sequence (A5/A6): avatar scales/blurs in at 0.1s,
 * the name reveals word-by-word at 0.2s (`TextReveal`), the taglines —
 * now a single rotating line instead of `AnimatedTextSlider`'s static
 * list — enter at 0.45s (`RoleRotator`), location and Resume fade up
 * at 0.55s. Gated by the same `useHeroPlayed` session flag as
 * `BannerSection`, so the two halves of the hero stay in sync without
 * needing a shared parent to orchestrate them.
 * @param {{ profile: import('@/lib/schemas/profile').profileSchema._type | null }} props
 */
export default function ProfileIdentity({ profile }) {
  const heroPlayed = useHeroPlayed();
  const initial = heroPlayed ? false : "hidden";

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-6 text-center sm:flex-row sm:items-center sm:text-left">
      <motion.div
        className="flex size-[104px] shrink-0 items-center justify-center rounded-xl bg-surface-2"
        initial={initial}
        animate="visible"
        variants={{
          hidden: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
          visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, delay: 0.1 } },
        }}
      >
        {profile?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, not a static import.
          <img
            src={withImageKitTransform(profile.photoUrl, "w-220,q-80,c-at_max")}
            alt={profile.name}
            className="size-full rounded-xl object-cover"
          />
        ) : (
          <span className="font-serif text-[30px] text-accent">
            {profile?.name ? initials(profile.name) : "TW"}
          </span>
        )}
      </motion.div>
      <div className="flex flex-1 flex-col gap-2">
        <TextReveal
          text={profile?.name ?? "Your Name"}
          as="h1"
          delay={0.2}
          className="font-serif text-[38px] leading-none tracking-[-0.95px] text-text-primary"
        />
        <div className="font-mono text-[13px] text-text-secondary">
          {profile?.taglines?.length ? (
            <RoleRotator roles={profile.taglines} />
          ) : (
            "Your tagline"
          )}
        </div>
        {profile?.location ? (
          <motion.p
            className="font-mono text-[11px] text-text-muted"
            initial={initial}
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.55 } },
            }}
          >
            {profile.location}
          </motion.p>
        ) : null}
      </div>
      {profile?.resumeUrl ? (
        <motion.div
          initial={initial}
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.55 } },
          }}
        >
          <TrackedLink
            trackTarget="Resume download"
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={dashedLinkClass}
          >
            Resume
            <ArrowRightIcon size={14} className="arrow text-accent" />
          </TrackedLink>
        </motion.div>
      ) : null}
    </div>
  );
}
