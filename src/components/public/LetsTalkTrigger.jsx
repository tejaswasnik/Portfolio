"use client";

import { useOpenContactModal } from "./ContactModalProvider";

// Matches Button's "primary" variant classes (src/components/ui/Button.jsx);
// kept as a plain <button> here as well since Button already renders one.
const ctaClass =
  "rounded-pill bg-cta-bg border border-cta-bg text-cta-text px-8 py-3.5 text-sm font-medium tracking-[0.005em] hover:bg-text-primary";

/** The "Let's Talk" CTA (Figma 5:6268 / 74:1070), opening the contact modal. */
export default function LetsTalkTrigger() {
  const openContactModal = useOpenContactModal();

  return (
    <button type="button" onClick={openContactModal} className={ctaClass}>
      Let&apos;s Talk →
    </button>
  );
}
