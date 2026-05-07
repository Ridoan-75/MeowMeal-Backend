import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { AIService } from "./ai.service";
import {
  chatSchema,
  menuDescriptionSchema,
  sentimentSchema,
} from "./ai.validation";
import { prisma } from "../../config/database";

const aiService = new AIService();

// 1. Meal Recommendations
export const getMealRecommendations = catchAsync(
  async (req: Request, res: Response) => {
    const recommendations = await aiService.getMealRecommendations(
      req.user!.id
    );
    sendResponse(
      res,
      200,
      true,
      "Recommendations generated successfully",
      recommendations
    );
  }
);

// 2. Chatbot
export const chat = catchAsync(async (req: Request, res: Response) => {
  const validated = chatSchema.parse(req.body);
  const response = await aiService.chat(
    validated.message,
    validated.conversationHistory
  );
  sendResponse(res, 200, true, "Chat response generated", response);
});

// 3. Menu Description Generator
export const generateMenuDescription = catchAsync(
  async (req: Request, res: Response) => {
    const validated = menuDescriptionSchema.parse(req.body);
    const description = await aiService.generateMenuDescription(validated);
    sendResponse(
      res,
      200,
      true,
      "Description generated successfully",
      description
    );
  }
);

// 4. Review Sentiment Analyzer
export const analyzeReviews = catchAsync(
  async (req: Request, res: Response) => {
    const validated = sentimentSchema.parse(req.body);

    const reviews = await prisma.review.findMany({
      where: { mealId: validated.mealId },
      select: { id: true, comment: true, rating: true },
    });

    if (reviews.length === 0) {
      return sendResponse(res, 404, false, "No reviews found for this meal");
    }

    const analysis = await aiService.analyzeReviewSentiment(reviews);
    sendResponse(res, 200, true, "Sentiment analysis completed", analysis);
  }
);