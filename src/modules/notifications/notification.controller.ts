import { Request, Response } from "express";
import { notificationService } from "./notification.service";
import { sendResponse } from "../../utils/apiResponse";
import { catchAsync } from "../../utils/catchAsync";

export const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const notifications = await notificationService.getByUser(req.user!.id);
  sendResponse(res, 200, true, "Notifications fetched", notifications);
});

export const markAllRead = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markAllRead(req.user!.id);
  sendResponse(res, 200, true, "All notifications marked as read");
});