import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { CartService } from "./cart.service";
import { addToCartSchema, updateCartItemSchema } from "./cart.validation";

const cartService = new CartService();

export const getCart = catchAsync(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id);
  sendResponse(res, 200, true, "Cart fetched successfully", cart);
});

export const addToCart = catchAsync(async (req: Request, res: Response) => {
  const validated = addToCartSchema.parse(req.body);
  const item = await cartService.addToCart(req.user!.id, validated);
  sendResponse(res, 200, true, "Item added to cart", item);
});

export const updateCartItem = catchAsync(
  async (req: Request, res: Response) => {
    const validated = updateCartItemSchema.parse(req.body);
    const item = await cartService.updateCartItem(
      req.user!.id,
      req.params.itemId as string,
      validated,
    );
    sendResponse(res, 200, true, "Cart item updated", item);
  },
);

export const removeFromCart = catchAsync(
  async (req: Request, res: Response) => {
    const result = await cartService.removeFromCart(
      req.user!.id,
      req.params.itemId as string,
    );
    sendResponse(res, 200, true, result.message);
  },
);

export const clearCart = catchAsync(async (req: Request, res: Response) => {
  const result = await cartService.clearCart(req.user!.id);
  sendResponse(res, 200, true, result.message);
});
