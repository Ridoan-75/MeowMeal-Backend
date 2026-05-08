import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { NewsletterService } from "./newsletter.service";
import { z } from "zod";

const newsletterService = new NewsletterService();

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const subscribe = catchAsync(async (req: Request, res: Response) => {
  const { email } = emailSchema.parse(req.body);
  const subscriber = await newsletterService.subscribe(email);
  sendResponse(res, 201, true, "Subscribed successfully!", subscriber);
});

export const getAllSubscribers = catchAsync(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await newsletterService.getAllSubscribers(page, limit);
    sendResponse(
      res,
      200,
      true,
      "Subscribers fetched successfully",
      result.subscribers,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      }
    );
  }
);