import { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth";
import { AppError } from "../errors/AppErrors";
import { prisma } from "../config/database";

// extend express Request type
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
    // Bearer token থেকে নেওয়ার চেষ্টা করো
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      req.headers["cookie"] = `better-auth.session_token=${token}`;
    }

    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session || !session.user) {
      throw new AppError("Unauthorized. Please login first.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("Your account has been suspended", 403);
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
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
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};
