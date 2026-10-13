"use client";

import Link from "next/link";
import { useTransitionNavigate } from "./TransitionProvider.jsx";

/**
 * Drop-in `next/link` replacement that runs the "drafting a new sheet"
 * transition instead of an instant client-side nav. Modified clicks
 * (ctrl/cmd/shift/alt, middle-click), `target="_blank"` links and
 * external hrefs fall through to Link's normal behavior untouched —
 * only a plain left-click on an internal link gets intercepted.
 * @param {{ href: string, flipKey?: string, onClick?: (e: React.MouseEvent) => void } & React.ComponentProps<typeof Link>} props
 */
export default function TransitionLink({ href, flipKey, onClick, children, ...props }) {
  const { navigate } = useTransitionNavigate();

  function handleClick(event) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (props.target && props.target !== "_self") return;
    if (typeof href !== "string" || /^(https?:)?\/\//.test(href)) return;

    event.preventDefault();
    navigate(href, { flipKey });
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
