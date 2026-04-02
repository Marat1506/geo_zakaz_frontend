import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  available: z.boolean(),
  readyNow: z.boolean(),
  preparationTime: z
    .number()
    .int()
    .positive("Preparation time must be positive"),
  zoneId: z.string().uuid("Please select a delivery zone"),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;
