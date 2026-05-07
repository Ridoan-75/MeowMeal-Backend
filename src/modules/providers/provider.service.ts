import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppErrors";
import {
  CreateProviderProfileInput,
  UpdateProviderProfileInput,
  ProviderQueryInput,
} from "./provider.validation";

export class ProviderService {
  // get all providers (public)
  async getAllProviders(query: ProviderQueryInput) {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const where: any = { isVerified: true };

    if (query.search) {
      where.OR = [
        { shopName: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.city) {
      where.city = { contains: query.city, mode: "insensitive" };
    }

    if (query.isOpen !== undefined) {
      where.isOpen = query.isOpen === "true";
    }

    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { meals: true },
          },
        },
      }),
      prisma.providerProfile.count({ where }),
    ]);

    return { providers, total, page, limit };
  }

  // get provider by id (public)
  async getProviderById(id: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        meals: {
          where: { isAvailable: true },
          include: {
            category: { select: { id: true, name: true } },
            reviews: { select: { rating: true } },
          },
        },
        _count: {
          select: { meals: true },
        },
      },
    });

    if (!provider) {
      throw new AppError("Provider not found", 404);
    }

    return provider;
  }

  // get my provider profile
  async getMyProfile(userId: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { meals: true },
        },
      },
    });

    if (!provider) {
      throw new AppError("Provider profile not found", 404);
    }

    return provider;
  }

  // create provider profile
  async createProviderProfile(
    userId: string,
    data: CreateProviderProfileInput,
  ) {
    const existing = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new AppError("Provider profile already exists", 400);
    }

    const provider = await prisma.providerProfile.create({
      data: { ...data, userId },
    });

    return provider;
  }

  // update provider profile
  async updateProviderProfile(
    userId: string,
    data: UpdateProviderProfileInput,
  ) {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!provider) {
      throw new AppError("Provider profile not found", 404);
    }

    const updated = await prisma.providerProfile.update({
      where: { userId },
      data,
    });

    return updated;
  }

  // toggle open/close status
  async toggleOpenStatus(userId: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!provider) {
      throw new AppError("Provider profile not found", 404);
    }

    const updated = await prisma.providerProfile.update({
      where: { userId },
      data: { isOpen: !provider.isOpen },
    });

    return updated;
  }

  // verify provider (admin)
  async verifyProvider(id: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new AppError("Provider not found", 404);
    }

    const updated = await prisma.providerProfile.update({
      where: { id },
      data: { isVerified: true },
    });

    return updated;
  }

  // get provider dashboard stats
  async getDashboardStats(userId: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!provider) {
      throw new AppError("Provider profile not found", 404);
    }

    const [totalMeals, totalOrders, recentOrders, revenue] = await Promise.all([
      prisma.meal.count({ where: { providerId: provider.id } }),
      prisma.order.count({ where: { providerId: provider.id } }),
      prisma.order.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { id: true, name: true } },
          items: {
            include: {
              meal: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          providerId: provider.id,
          status: "DELIVERED",
        },
        _sum: { totalAmount: true },
      }),
    ]);

    // monthly revenue for chart
    const monthlyRevenue = await prisma.$queryRaw<
      { month: string; revenue: number }[]
    >`
      SELECT 
        TO_CHAR("createdAt", 'Mon') as month,
        SUM("totalAmount") as revenue
      FROM "Order"
      WHERE "providerId" = ${provider.id}
        AND status = 'DELIVERED'
        AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC
    `;

    return {
      totalMeals,
      totalOrders,
      totalRevenue: revenue._sum.totalAmount || 0,
      recentOrders,
      monthlyRevenue,
    };
  }
}
