import { z } from "zod";

export const eventTypeValues = ["view", "click"];

export const eventSchema = z.object({
  type: z.enum(eventTypeValues),
  path: z.string().trim().min(1),
  target: z.string().trim().default(""),
  referrer: z.string().trim().default(""),
  country: z.string().trim().default(""),
  device: z.string().trim().default(""),
  browser: z.string().trim().default(""),
  os: z.string().trim().default(""),
  visitorHash: z.string().min(1),
  createdAt: z.date().optional(),
});

/**
 * What the client beacon (`src/components/public/AnalyticsBeacon.jsx`)
 * actually sends to `POST /api/track` — just the visitor-supplied part
 * of an event. The route handler fills in `country`/`device`/`browser`/
 * `os`/`visitorHash` server-side (never trusts the client for those)
 * before validating the full `eventSchema` and inserting.
 */
export const trackEventInputSchema = z.object({
  type: z.enum(eventTypeValues),
  path: z.string().trim().min(1).max(500),
  target: z.string().trim().max(200).default(""),
  referrer: z.string().trim().max(500).default(""),
});
