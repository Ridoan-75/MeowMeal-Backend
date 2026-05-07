import { z } from "zod";

export const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .default([]),
});

export const menuDescriptionSchema = z.object({
  title: z.string().min(2, "Title is required"),
  ingredients: z.string().optional(),
  cuisine: z.string().optional(),
  spiceLevel: z.string().optional(),
});

export const sentimentSchema = z.object({
  mealId: z.string().min(1, "Meal ID is required"),
});

export type ChatInput = z.infer<typeof chatSchema>;
export type MenuDescriptionInput = z.infer<typeof menuDescriptionSchema>;
export type SentimentInput = z.infer<typeof sentimentSchema>;