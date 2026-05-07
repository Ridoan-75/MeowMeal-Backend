import { z } from "zod";

export const addToCartSchema = z.object({
  mealId: z.string().min(1, "Meal is required"),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be positive"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;