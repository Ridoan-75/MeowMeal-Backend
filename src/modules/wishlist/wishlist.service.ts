import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppErrors";

export class WishlistService {
  async toggleWishlist(customerId: string, mealId: string) {
    const existing = await prisma.wishlist.findUnique({
      where: { customerId_mealId: { customerId, mealId } },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { customerId_mealId: { customerId, mealId } },
      });
      return { wishlisted: false, message: "Removed from wishlist" };
    }

    const meal = await prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new AppError("Meal not found", 404);

    await prisma.wishlist.create({
      data: { customerId, mealId },
    });

    return { wishlisted: true, message: "Added to wishlist" };
  }

  async getMyWishlist(customerId: string, page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          meal: {
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
              reviews: { select: { rating: true } },
            },
          },
        },
      }),
      prisma.wishlist.count({ where: { customerId } }),
    ]);

    const meals = items.map((item) => {
      const avgRating =
        item.meal.reviews.length > 0
          ? item.meal.reviews.reduce((sum, r) => sum + r.rating, 0) /
            item.meal.reviews.length
          : 0;

      return {
        ...item.meal,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: item.meal.reviews.length,
        wishlistedAt: item.createdAt,
      };
    });

    return { meals, total, page, limit };
  }

  async checkWishlist(customerId: string, mealId: string) {
    const existing = await prisma.wishlist.findUnique({
      where: { customerId_mealId: { customerId, mealId } },
    });
    return { wishlisted: !!existing };
  }

  async getWishlistCount(customerId: string) {
    const count = await prisma.wishlist.count({ where: { customerId } });
    return { count };
  }
}