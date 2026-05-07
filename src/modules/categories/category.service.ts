import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppErrors";
import { getOrSetCache, cacheKeys, cache } from "../../lib/cache";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.validation";

export class CategoryService {
  // get all categories
  async getAllCategories() {
    return getOrSetCache(cacheKeys.allCategories, async () => {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { meals: true },
          },
        },
      });

      return categories;
    });
  }

  // get category by id
  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { meals: true },
        },
      },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return category;
  }

  // create category (admin)
  async createCategory(data: CreateCategoryInput) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
      },
    });

    if (existing) {
      throw new AppError("Category with this name or slug already exists", 400);
    }

    const category = await prisma.category.create({ data });
    cache.del(cacheKeys.allCategories);
    return category;
  }

  // update category (admin)
  async updateCategory(id: string, data: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    return updated;
  }

  // delete category (admin)
  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { meals: true } },
      },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (category._count.meals > 0) {
      throw new AppError(
        "Cannot delete category with existing meals. Remove meals first.",
        400,
      );
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: "Category deleted successfully" };
  }
}
