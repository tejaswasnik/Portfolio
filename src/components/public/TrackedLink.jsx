"use client";

import { trackEvent } from "@/lib/analytics/trackEvent.js";

/**
 * A plain `<a>` that beacons a `click` event first (PRD §3.2's tracked
 * links: GitHub, LinkedIn, X, live links, project GitHub links,
 * resume). A tiny client component so the server components that render
 * these links (ContactLinksRow, ProfileIdentity, ProjectCard, the
 * project details page) don't need to become client components
 * themselves — same pattern as `MessageMeTrigger` (step 3).
 * `trackTarget` is the analytics target label — named differently from
 * the native anchor `target` attribute (e.g. `"_blank"`) so both can be
 * passed at once without colliding.
 * @param {{ trackTarget: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>} props
 */
export default function TrackedLink({ trackTarget, onClick, ...props }) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackEvent("click", { target: trackTarget });
        onClick?.(event);
      }}
    />
  );
}
