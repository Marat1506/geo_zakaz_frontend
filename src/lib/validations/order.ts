import { z } from "zod";

export const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, "Please provide a complete address"),
  phone: z.string().min(10, "Please provide a valid phone number"),
  specialInstructions: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
