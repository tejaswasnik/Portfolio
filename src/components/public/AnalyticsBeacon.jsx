"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/trackEvent.js";

/**
 * Beacons a `view` event on first load and every client-side route
 * change (PRD §3.2: "beacons /api/track on route change"). Renders
 * nothing — mounted once in `PageFrame` so every public page gets it
 * without each page remembering to add it (same pattern as
 * `ContactModalProvider`, step 5).
 */
export default function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("view", { path: pathname });
  }, [pathname]);

  return null;
}
