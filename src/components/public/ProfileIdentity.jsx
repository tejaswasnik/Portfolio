import TrackedLink from "@/components/public/TrackedLink";

// Matches Button's "dashed" variant classes (src/components/ui/Button.jsx)
// without reaching for an <a> rendered through a <button>-only component —
// step 1's primitives are out of scope for this step (docs/DECISIONS.md).
const dashedLinkClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-border-default px-3.5 py-2.5 text-text-primary text-[11px] font-bold font-mono uppercase transition-colors hover:border-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
 * @param {{ profile: import('@/lib/schemas/profile').profileSchema._type | null }} props
 */
export default function ProfileIdentity({ profile }) {
  return (
    <div className="flex items-center gap-6 px-6 py-6">
      <div className="flex size-[104px] shrink-0 items-center justify-center rounded-xl bg-surface-2">
        {profile?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, not a static import.
          <img
            src={profile.photoUrl}
            alt={profile.name}
            className="size-full rounded-xl object-cover"
          />
        ) : (
          <span className="font-serif text-[30px] text-accent">
            {profile?.name ? initials(profile.name) : "TW"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="font-serif text-[38px] leading-none tracking-[-0.95px] text-text-primary">
          {profile?.name ?? "Your Name"}
        </p>
        <p className="font-mono text-[13px] text-text-secondary">
          {profile?.tagline ?? "Your tagline"}
        </p>
        {profile?.location ? (
          <p className="font-mono text-[11px] text-text-muted">
            {profile.location}
          </p>
        ) : null}
      </div>
      {profile?.resumeUrl ? (
        <TrackedLink
          trackTarget="Resume download"
          href={profile.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={dashedLinkClass}
        >
          Resume
        </TrackedLink>
      ) : null}
    </div>
  );
}
