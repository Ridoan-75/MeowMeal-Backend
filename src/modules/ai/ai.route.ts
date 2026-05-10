import { Router } from "express";
import {
  getMealRecommendations,
  chat,
  generateMenuDescription,
  analyzeReviews,
  analyzePlatform,
} from "./ai.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// customer only
router.get(
  "/recommendations",
  authenticate,
  authorize("CUSTOMER"),
  getMealRecommendations,
);

// all authenticated users
router.post("/chat", authenticate, chat);

// provider only
router.post(
  "/generate-description",
  authenticate,
  authorize("PROVIDER"),
  generateMenuDescription,
);

// provider and admin
router.post(
  "/analyze-reviews",
  authenticate,
  authorize("PROVIDER", "ADMIN"),
  analyzeReviews,
);

router.get(
  "/analyze-platform",
  authenticate,
  authorize("ADMIN"),
  analyzePlatform,
);

export default router;
