import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppErrors";

export class NewsletterService {
  async subscribe(email: string) {
    const existing = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      throw new AppError("This email is already subscribed", 400);
    }

    const subscriber = await prisma.newsletter.create({
      data: { email },
    });

    return subscriber;
  }

  async getAllSubscribers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      prisma.newsletter.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.newsletter.count(),
    ]);

    return { subscribers, total, page, limit };
  }
}