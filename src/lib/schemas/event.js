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
