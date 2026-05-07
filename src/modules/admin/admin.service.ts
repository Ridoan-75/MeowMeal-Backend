import { prisma } from "../../config/database";
import { getOrSetCache, cacheKeys, cache } from "../../lib/cache";

export class AdminService {
  async getDashboardStats() {
    return getOrSetCache(cacheKeys.adminStats, async () => {
      const [
        totalUsers,
        totalProviders,
        totalOrders,
        totalMeals,
        totalRevenue,
        recentOrders,
        ordersByStatus,
        topMeals,
        monthlyOrders,
        monthlyRevenue,
      ] = await Promise.all([
        // total customers
        prisma.user.count({ where: { role: "CUSTOMER" } }),

        // total providers
        prisma.providerProfile.count({ where: { isVerified: true } }),

        // total orders
        prisma.order.count(),

        // total meals
        prisma.meal.count({ where: { isAvailable: true } }),

        // total revenue
        prisma.order.aggregate({
          where: { status: "DELIVERED" },
          _sum: { totalAmount: true },
        }),

        // recent 5 orders
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            customer: { select: { id: true, name: true, email: true } },
            items: {
              include: {
                meal: { select: { id: true, title: true } },
              },
            },
          },
        }),

        // orders by status (pie chart)
        prisma.order.groupBy({
          by: ["status"],
          _count: { status: true },
        }),

        // top 5 meals by order count
        prisma.orderItem.groupBy({
          by: ["mealId"],
          _count: { mealId: true },
          orderBy: { _count: { mealId: "desc" } },
          take: 5,
        }),

        // monthly orders for line chart
        prisma.$queryRaw<{ month: string; count: number }[]>`
          SELECT
            TO_CHAR("createdAt", 'Mon YYYY') as month,
            COUNT(*) as count
          FROM "Order"
          WHERE "createdAt" >= NOW() - INTERVAL '6 months'
          GROUP BY TO_CHAR("createdAt", 'Mon YYYY'), DATE_TRUNC('month', "createdAt")
          ORDER BY DATE_TRUNC('month', "createdAt") ASC
        `,

        // monthly revenue for bar chart
        prisma.$queryRaw<{ month: string; revenue: number }[]>`
          SELECT
            TO_CHAR("createdAt", 'Mon YYYY') as month,
            SUM("totalAmount") as revenue
          FROM "Order"
          WHERE status = 'DELIVERED'
            AND "createdAt" >= NOW() - INTERVAL '6 months'
          GROUP BY TO_CHAR("createdAt", 'Mon YYYY'), DATE_TRUNC('month', "createdAt")
          ORDER BY DATE_TRUNC('month', "createdAt") ASC
        `,
      ]);

      // top meals full data
      const topMealIds = topMeals.map((m) => m.mealId);
      const topMealsData = await prisma.meal.findMany({
        where: { id: { in: topMealIds } },
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          provider: { select: { shopName: true } },
        },
      });

      const topMealsWithCount = topMealsData.map((meal) => ({
        ...meal,
        orderCount:
          topMeals.find((m) => m.mealId === meal.id)?._count.mealId || 0,
      }));

      return {
        overview: {
          totalUsers,
          totalProviders,
          totalOrders,
          totalMeals,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
        },
        recentOrders,
        ordersByStatus: ordersByStatus.map((o) => ({
          status: o.status,
          count: o._count.status,
        })),
        topMeals: topMealsWithCount,
        monthlyOrders,
        monthlyRevenue,
      };
    });
  }

  async invalidateStatsCache() {
    cache.del(cacheKeys.adminStats);
  }
}