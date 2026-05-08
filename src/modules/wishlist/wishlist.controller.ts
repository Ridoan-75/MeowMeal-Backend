import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { WishlistService } from "./wishlist.service";

const wishlistService = new WishlistService();

export const toggleWishlist = catchAsync(
  async (req: Request, res: Response) => {
    const { mealId } = req.params;
    const result = await wishlistService.toggleWishlist(req.user!.id, mealId as string);
    sendResponse(res, 200, true, result.message, {
      wishlisted: result.wishlisted,
    });
  },
);

export const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const result = await wishlistService.getMyWishlist(req.user!.id, page, limit);
  sendResponse(res, 200, true, "Wishlist fetched", result.meals, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

export const checkWishlist = catchAsync(async (req: Request, res: Response) => {
  const { mealId } = req.params;
  const result = await wishlistService.checkWishlist(req.user!.id, mealId as string);
  sendResponse(res, 200, true, "Wishlist status", result);
});

export const getWishlistCount = catchAsync(
  async (req: Request, res: Response) => {
    const result = await wishlistService.getWishlistCount(req.user!.id);
    sendResponse(res, 200, true, "Wishlist count", result);
  },
);
