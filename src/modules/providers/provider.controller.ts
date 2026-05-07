import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { ProviderService } from "./provider.service";
import {
  createProviderProfileSchema,
  updateProviderProfileSchema,
  providerQuerySchema,
} from "./provider.validation";

const providerService = new ProviderService();

export const getAllProviders = catchAsync(
  async (req: Request, res: Response) => {
    const query = providerQuerySchema.parse(req.query);
    const result = await providerService.getAllProviders(query);

    sendResponse(
      res,
      200,
      true,
      "Providers fetched successfully",
      result.providers,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      }
    );
  }
);

export const getProviderById = catchAsync(
  async (req: Request, res: Response) => {
    const provider = await providerService.getProviderById(req.params.id as string);
    sendResponse(res, 200, true, "Provider fetched successfully", provider);
  }
);

export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const provider = await providerService.getMyProfile(req.user!.id);
  sendResponse(res, 200, true, "Profile fetched successfully", provider);
});

export const createProviderProfile = catchAsync(
  async (req: Request, res: Response) => {
    const validated = createProviderProfileSchema.parse(req.body);
    const provider = await providerService.createProviderProfile(
      req.user!.id,
      validated
    );
    sendResponse(res, 201, true, "Provider profile created successfully", provider);
  }
);

export const updateProviderProfile = catchAsync(
  async (req: Request, res: Response) => {
    const validated = updateProviderProfileSchema.parse(req.body);
    const provider = await providerService.updateProviderProfile(
      req.user!.id,
      validated
    );
    sendResponse(res, 200, true, "Profile updated successfully", provider);
  }
);

export const toggleOpenStatus = catchAsync(
  async (req: Request, res: Response) => {
    const provider = await providerService.toggleOpenStatus(req.user!.id);
    sendResponse(res, 200, true, "Status updated successfully", provider);
  }
);

export const verifyProvider = catchAsync(
  async (req: Request, res: Response) => {
    const provider = await providerService.verifyProvider(req.params.id as string);
    sendResponse(res, 200, true, "Provider verified successfully", provider);
  }
);

export const getDashboardStats = catchAsync(
  async (req: Request, res: Response) => {
    const stats = await providerService.getDashboardStats(req.user!.id);
    sendResponse(res, 200, true, "Dashboard stats fetched successfully", stats);
  }
);