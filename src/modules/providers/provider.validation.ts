import { z } from "zod";

export const createProviderProfileSchema = z.object({
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  phone: z.string().optional(),
});

export const updateProviderProfileSchema =
  createProviderProfileSchema.partial();

export const providerQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  city: z.string().optional(),
  isOpen: z.string().optional(),
});

export type CreateProviderProfileInput = z.infer<
  typeof createProviderProfileSchema
>;
export type UpdateProviderProfileInput = z.infer<
  typeof updateProviderProfileSchema
>;
export type ProviderQueryInput = z.infer<typeof providerQuerySchema>;