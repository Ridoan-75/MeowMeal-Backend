import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppErrors";
import { prisma } from "../config/database";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
        name: string;
        isActive: boolean;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Unauthorized. Please login first.", 401);
    }

    const token = authHeader.split(" ")[1];

    // Session verify করো
    const session = await prisma.session.findUnique({
      where: { token },
      select: {
        id: true,
        expiresAt: true,
        userId: true,
      },
    });

    if (!session) {
      throw new AppError("Invalid or expired session. Please login again.", 401);
    }

    if (session.expiresAt < new Date()) {
      throw new AppError("Session expired. Please login again.", 401);
    }

    // Fresh user data — always latest role from DB
    const freshUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    if (!freshUser) {
      throw new AppError("User not found.", 401);
    }

    if (!freshUser.isActive) {
      throw new AppError("Your account has been suspended.", 403);
    }

    req.user = {
      id: freshUser.id,
      role: freshUser.role as string,
      email: freshUser.email,
      name: freshUser.name,
      isActive: freshUser.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};