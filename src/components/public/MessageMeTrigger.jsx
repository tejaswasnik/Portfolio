"use client";

import { useOpenContactModal } from "./ContactModalProvider";
import { trackEvent } from "@/lib/analytics/trackEvent.js";

/**
 * The contact row's "Message me" cell (Figma 10:1085). A tiny client
 * component so ContactLinksRow itself can stay a server component —
 * only the click handler needs the browser.
 */
export default function MessageMeTrigger({ icon, label }) {
  const openContactModal = useOpenContactModal();

  return (
    <button
      type="button"
      onClick={(event) => {
        trackEvent("click", { target: "Contact button" });
        openContactModal(event);
      }}
      className="lift press flex flex-1 items-center justify-center gap-2.5 bg-bg px-5 py-5"
    >
      <span className="flex size-8 items-center justify-center rounded-lg border border-border-default bg-surface-3 text-accent">
        {icon}
      </span>
      <span className="text-[13px] font-semibold text-accent">{label}</span>
    </button>
  );
}
