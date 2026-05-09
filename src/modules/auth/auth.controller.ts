import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { AuthService } from "./auth.service";
import { updateProfileSchema } from "./auth.validation";

const authService = new AuthService();

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.id);
  sendResponse(res, 200, true, "User fetched successfully", user);
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const validated = updateProfileSchema.parse(req.body);
  const user = await authService.updateProfile(req.user!.id, validated);
  sendResponse(res, 200, true, "Profile updated successfully", user);
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const { role, ...rest } = req.body;

  // role update separately
  if (role) {
    await authService.updateRole(req.user!.id, role);
  }

  const user = await authService.updateProfile(req.user!.id, rest);
  sendResponse(res, 200, true, "Updated successfully", user);
});

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;

  const result = await authService.getAllUsers(page, limit, role, search);

  sendResponse(res, 200, true, "Users fetched successfully", result.users, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

export const toggleUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const user = await authService.toggleUserStatus(req.params.id as string);
    sendResponse(res, 200, true, "User status updated successfully", user);
  },
);
