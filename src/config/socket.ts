import { Server } from "socket.io";
import { logger } from "../utils/logger";
import { prisma } from "./database";

export let io: any;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", process.env.CLIENT_URL as string],
      credentials: true,
    },
  });

  io.on("connection", async (socket: any) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Token থেকে automatically room এ join করো
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const session = await prisma.session.findUnique({
          where: { token },
          select: { userId: true },
        });
        if (session?.userId) {
          socket.join(session.userId);
          logger.info(`User ${session.userId} joined room`);
        }
      }
    } catch (err) {
      logger.error("Socket auth error");
    }

    // Manual join support
    socket.on("join", (userId: string) => {
      socket.join(userId);
      logger.info(`User ${userId} joined room manually`);
    });

    socket.on("join_provider", (providerId: string) => {
      socket.join(`provider_${providerId}`);
      logger.info(`Provider ${providerId} joined room`);
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

export const sendNotification = (
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  },
) => {
  if (io) {
    io.to(userId).emit("notification", {
      ...notification,
      createdAt: new Date(),
    });
  }
};

export const sendProviderNotification = (
  providerId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  },
) => {
  if (io) {
    io.to(`provider_${providerId}`).emit("notification", {
      ...notification,
      createdAt: new Date(),
    });
  }
};