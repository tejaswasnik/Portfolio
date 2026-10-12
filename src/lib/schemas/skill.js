import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().trim().min(1),
  icon: z.string().trim().min(1),
  category: z.string().trim().default(""),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
});
