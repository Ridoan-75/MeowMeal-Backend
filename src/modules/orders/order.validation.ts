import { z } from "zod";

export const createOrderSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  deliveryCity: z.string().min(2, "Delivery city is required"),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        mealId: z.string().min(1, "Meal is required"),
        quantity: z.number().int().positive("Quantity must be positive"),
      })
    )
    .min(1, "At least one item is required"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PREPARING", "READY", "DELIVERED", "CANCELLED"]),
});

export const orderQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z
    .enum(["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"])
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;