import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { ReviewService } from "./review.service";
import { createReviewSchema, reviewQuerySchema } from "./review.validation";

const reviewService = new ReviewService();

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const validated = createReviewSchema.parse(req.body);
  const review = await reviewService.createReview(req.user!.id, validated);
  sendResponse(res, 201, true, "Review created successfully", review);
});

export const getReviews = catchAsync(async (req: Request, res: Response) => {
  const query = reviewQuerySchema.parse(req.query);
  const result = await reviewService.getReviewsByMeal(query);

  sendResponse(res, 200, true, "Reviews fetched successfully", result.reviews, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

export const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const query = reviewQuerySchema.parse(req.query);
  const result = await reviewService.getMyReviews(req.user!.id, query);

  sendResponse(res, 200, true, "Reviews fetched successfully", result.reviews, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.deleteReview(req.params.id as string);
  sendResponse(res, 200, true, result.message);
});
