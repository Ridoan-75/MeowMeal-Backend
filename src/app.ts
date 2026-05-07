import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth";
import { errorHandler } from "./errors/errorHandler";
import { apiLimiter } from "./middlewares/rateLimiter";
import { logger } from "./utils/logger";
import morgan from "morgan";
import routes from "./routes";

const app: Application = express();

// ─── Security Middlewares ─────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

// ─── Better Auth Handler ──────────────────────────────
app.all("/api/auth/*splat", toNodeHandler(auth));

// ─── Body Parser ──────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────
app.use(morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// ─── Rate Limiting ────────────────────────────────────
app.use("/api", apiLimiter);

// ─── Routes ───────────────────────────────────────────
app.use("/api", routes);

// ─── Health Check ─────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", message: "MeowMeal API is running 🐱" });
});

// ─── Error Handler ────────────────────────────────────
app.use(errorHandler);

export default app;