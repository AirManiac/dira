import { z } from "zod";

export const deviceTypeSchema = z.enum([
  "desktop",
  "mobile",
  "tablet",
  "bot",
]);

export const clickStatusSchema = z.enum([
  "success",
  "redirect",
  "not_found",
  "error",
]);

export const clickEventSchema = z.object({
  id: z.string().min(1),

  timestamp: z.number(),

  linkId: z.string().min(1),
  slug: z.string().min(1),
  destination: z.string().url(),

  country: z.string().min(1),
  city: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),

  referrer: z.string().nullable(),
  userAgent: z.string().min(1),
  device: deviceTypeSchema,

  status: clickStatusSchema,
  responseTime: z.number().nonnegative(),
});

export type ValidatedClickEvent = z.infer<typeof clickEventSchema>;