import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { MealService } from "./meal.service";
import {
  createMealSchema,
  updateMealSchema,
  mealQuerySchema,
} from "./meal.validation";

const mealService = new MealService();

export const getAllMeals = catchAsync(async (req: Request, res: Response) => {
  const query = mealQuerySchema.parse(req.query);
  const result = await mealService.getAllMeals(query);

  sendResponse(res, 200, true, "Meals fetched successfully", result.meals, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

export const getMealById = catchAsync(async (req: Request, res: Response) => {
  const meal = await mealService.getMealById(req.params.id as string);
  sendResponse(res, 200, true, "Meal fetched successfully", meal);
});

export const getProviderMeals = catchAsync(
  async (req: Request, res: Response) => {
    const query = mealQuerySchema.parse(req.query);
    const result = await mealService.getMealsByProvider(
      req.params.providerId as string,
      query,
    );

    sendResponse(
      res,
      200,
      true,
      "Provider meals fetched successfully",
      result.meals,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    );
  },
);

export const createMeal = catchAsync(async (req: Request, res: Response) => {
  // provider profile id লাগবে
  const providerProfile = await import("../../config/database").then((m) =>
    m.prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
    }),
  );

  if (!providerProfile) {
    return sendResponse(res, 404, false, "Provider profile not found");
  }

  const validated = createMealSchema.parse(req.body);
  const meal = await mealService.createMeal(providerProfile.id, validated);
  sendResponse(res, 201, true, "Meal created successfully", meal);
});

export const updateMeal = catchAsync(async (req: Request, res: Response) => {
  const providerProfile = await import("../../config/database").then((m) =>
    m.prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
    }),
  );

  if (!providerProfile) {
    return sendResponse(res, 404, false, "Provider profile not found");
  }

  const validated = updateMealSchema.parse(req.body);
  const meal = await mealService.updateMeal(
    req.params.id as string,
    providerProfile.id,
    validated,
  );
  sendResponse(res, 200, true, "Meal updated successfully", meal);
});

export const deleteMeal = catchAsync(async (req: Request, res: Response) => {
  const providerProfile = await import("../../config/database").then((m) =>
    m.prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
    }),
  );

  if (!providerProfile) {
    return sendResponse(res, 404, false, "Provider profile not found");
  }

  const result = await mealService.deleteMeal(
    req.params.id as string,
    providerProfile.id,
  );
  sendResponse(res, 200, true, result.message);
});

export const toggleMealAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const providerProfile = await import("../../config/database").then((m) =>
      m.prisma.providerProfile.findUnique({
        where: { userId: req.user!.id },
      }),
    );

    if (!providerProfile) {
      return sendResponse(res, 404, false, "Provider profile not found");
    }

    const meal = await mealService.toggleAvailability(
      req.params.id as string,
      providerProfile.id,
    );
    sendResponse(res, 200, true, "Meal availability updated", meal);
  },
);
