import "dotenv/config";
import http from "http";
import app from "./app";
import { prisma } from "./config/database";
import { logger } from "./utils/logger";
import { initSocket } from "./config/socket";

const PORT = process.env.PORT ;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");

    // http server বানাও socket এর জন্য
    const httpServer = http.createServer(app);

    // socket initialize করো
    initSocket(httpServer);
    logger.info("Socket.io initialized");

    httpServer.listen(PORT, () => {
      logger.info(`MeowMeal server running on port ${PORT} yahoooo!`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();