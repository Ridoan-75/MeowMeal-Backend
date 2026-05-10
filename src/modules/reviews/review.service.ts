import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppErrors";
import { CreateReviewInput, ReviewQueryInput } from "./review.validation";

export class ReviewService {
  // create review (customer)
  async createReview(customerId: string, data: CreateReviewInput) {
    // Check if customer has ordered this meal
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        mealId: data.mealId,
        order: {
          customerId,
        },
      },
    });

    if (!hasOrdered) {
      throw new AppError(
        "You can only review meals you have ordered and received",
        403,
      );
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        mealId: data.mealId,
        customerId,
      },
    });

    if (existingReview) {
      throw new AppError("You have already reviewed this meal", 400);
    }

    const review = await prisma.review.create({
      data: {
        ...data,
        customerId,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    return review;
  }

  // get reviews by meal
  async getReviewsByMeal(query: ReviewQueryInput) {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.mealId) where.mealId = query.mealId;
    if (query.rating) where.rating = parseInt(query.rating);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total, page, limit };
  }

  // get my reviews (customer)
  async getMyReviews(customerId: string, query: ReviewQueryInput) {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { customerId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          meal: {
            select: { id: true, title: true, images: true },
          },
        },
      }),
      prisma.review.count({ where: { customerId } }),
    ]);

    return { reviews, total, page, limit };
  }

  // delete review (admin)
  async deleteReview(id: string) {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    await prisma.review.delete({ where: { id } });

    return { message: "Review deleted successfully" };
  }

  // update sentiment (called after AI analysis)
  async updateSentiment(id: string, sentiment: string) {
    const review = await prisma.review.update({
      where: { id },
      data: { sentiment },
    });

    return review;
  }
}
