import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "../utils/logger";
import { prisma } from "./database";

export let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        process.env.CLIENT_URL as string,
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // user নিজের room এ join করবে
    socket.on("join", (userId: string) => {
      socket.join(userId);
      logger.info(`User ${userId} joined room`);
    });

    // provider নিজের room এ join করবে
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

// notification পাঠানোর helper functions
export const sendNotification = (
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }
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
  }
) => {
  if (io) {
    io.to(`provider_${providerId}`).emit("notification", {
      ...notification,
      createdAt: new Date(),
    });
  }
};