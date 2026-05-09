import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppErrors";
import {
  CreateMealInput,
  UpdateMealInput,
  MealQueryInput,
} from "./meal.validation";

export class MealService {
  // get all meals (public) with search, filter, sort, pagination
  async getAllMeals(query: MealQueryInput) {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const where: any = {
      isAvailable: true,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { tags: { has: query.search } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }

    const [meals, total] = await Promise.all([
      prisma.meal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          provider: {
            select: {
              id: true,
              shopName: true,
              logo: true,
              city: true,
              isOpen: true,
            },
          },
          reviews: {
            select: { rating: true },
          },
        },
      }),
      prisma.meal.count({ where }),
    ]);

    // average rating calculate করো
    const mealsWithRating = meals.map((meal) => {
      const avgRating =
        meal.reviews.length > 0
          ? meal.reviews.reduce((sum, r) => sum + r.rating, 0) /
            meal.reviews.length
          : 0;

      return {
        ...meal,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: meal.reviews.length,
        reviews: undefined,
      };
    });

    return { meals: mealsWithRating, total, page, limit };
  }

  // get meal by id (public)
  async getMealById(id: string) {
    const meal = await prisma.meal.findUnique({
      where: { id },
      include: {
        category: true,
        provider: {
          select: {
            id: true,
            shopName: true,
            logo: true,
            coverImage: true,
            address: true,
            city: true,
            phone: true,
            isOpen: true,
            isVerified: true,
          },
        },
        reviews: {
          include: {
            customer: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!meal) {
      throw new AppError("Meal not found", 404);
    }

    const avgRating =
      meal.reviews.length > 0
        ? meal.reviews.reduce((sum, r) => sum + r.rating, 0) /
          meal.reviews.length
        : 0;

    return {
      ...meal,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: meal.reviews.length,
    };
  }

  // get meals by provider
  async getMealsByProvider(providerId: string, query: MealQueryInput) {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const [meals, total] = await Promise.all([
      prisma.meal.findMany({
        where: { providerId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { reviews: true, orderItems: true } },
        },
      }),
      prisma.meal.count({ where: { providerId } }),
    ]);

    return { meals, total, page, limit };
  }

  // create meal (provider)
  async createMeal(providerId: string, data: CreateMealInput) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const meal = await prisma.meal.create({
      data: { ...data, providerId },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return meal;
  }

  // update meal (provider)
  async updateMeal(id: string, providerId: string, data: UpdateMealInput) {
    const meal = await prisma.meal.findUnique({ where: { id } });

    if (!meal) {
      throw new AppError("Meal not found", 404);
    }

    if (meal.providerId !== providerId) {
      throw new AppError("You can only update your own meals", 403);
    }

    const updated = await prisma.meal.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return updated;
  }

  // delete meal (provider)
  async deleteMeal(id: string, providerId: string) {
    const meal = await prisma.meal.findUnique({ where: { id } });

    if (!meal) {
      throw new AppError("Meal not found", 404);
    }

    if (meal.providerId !== providerId) {
      throw new AppError("You can only delete your own meals", 403);
    }

    await prisma.meal.update({
      where: { id },
      data: { isAvailable: false },
    });

    return { message: "Meal deleted successfully" };
  }

  // toggle meal availability (provider)
  async toggleAvailability(id: string, providerId: string) {
    const meal = await prisma.meal.findUnique({ where: { id } });

    if (!meal) {
      throw new AppError("Meal not found", 404);
    }

    if (meal.providerId !== providerId) {
      throw new AppError("You can only update your own meals", 403);
    }

    const updated = await prisma.meal.update({
      where: { id },
      data: { isAvailable: !meal.isAvailable },
    });

    return updated;
  }
}
