import { z } from "zod";

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const circleZoneSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.literal("circle"),
  center: locationSchema,
  radius: z.number().positive("Radius must be positive"),
  active: z.boolean(),
});

export const polygonZoneSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.literal("polygon"),
  coordinates: z
    .array(locationSchema)
    .min(3, "Polygon must have at least 3 points"),
  active: z.boolean(),
});

export const serviceZoneSchema = z.discriminatedUnion("type", [
  circleZoneSchema,
  polygonZoneSchema,
]);

export type ServiceZoneFormData = z.infer<typeof serviceZoneSchema>;
