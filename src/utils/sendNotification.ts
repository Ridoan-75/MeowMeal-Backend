import { prisma } from "../config/database";

export class NotificationService {
  async create(
    userId: string,
    title: string,
    message: string,
    type: string = "INFO",
  ) {
    return prisma.notification.create({
      data: { userId, title, message, type },
    });
  }

  async getByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}

export const notificationService = new NotificationService();
