import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { CategoryService } from "./category.service";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";

const categoryService = new CategoryService();

export const getAllCategories = catchAsync(
  async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();
    sendResponse(res, 200, true, "Categories fetched successfully", categories);
  }
);

export const getCategoryById = catchAsync(
  async (req: Request, res: Response) => {
    const category = await categoryService.getCategoryById(req.params.id as string);
    sendResponse(res, 200, true, "Category fetched successfully", category);
  }
);

export const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const validated = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(validated);
    sendResponse(res, 201, true, "Category created successfully", category);
  }
);

export const updateCategory = catchAsync(
  async (req: Request, res: Response) => {
    const validated = updateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(
      req.params.id as string,
      validated
    );
    sendResponse(res, 200, true, "Category updated successfully", category);
  }
);

export const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await categoryService.deleteCategory(req.params.id as string);
    sendResponse(res, 200, true, result.message);
  }
);