import "dotenv/config";
import app from "./app";
import { prisma } from "./config/database";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");

    app.listen(PORT, () => {
      logger.info(`MeowMeal server running on port ${PORT} yahoooo!`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();