import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppErrors";
import { RegisterInput, UpdateProfileInput } from "./auth.validation";

export class AuthService {
  // get user by id
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        image: true,
        isActive: true,
        createdAt: true,
        providerProfile: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  // update profile
  async updateProfile(id: string, data: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        image: true,
        isActive: true,
        createdAt: true,
      },
    });

    return updated;
  }

  // get all users (admin)
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = role ? { role: role as any } : {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          city: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  // toggle user status (admin)
  async toggleUserStatus(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return updated;
  }
}
