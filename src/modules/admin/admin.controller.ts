import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { AdminService } from "./admin.service";

const adminService = new AdminService();

export const getDashboardStats = catchAsync(
  async (_req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    sendResponse(
      res,
      200,
      true,
      "Dashboard stats fetched successfully",
      stats
    );
  }
);