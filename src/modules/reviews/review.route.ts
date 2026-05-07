import { Router } from "express";
import {
  createReview,
  getReviews,
  getMyReviews,
  deleteReview,
} from "./review.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// public
router.get("/", getReviews);

// customer only
router.post("/", authenticate, authorize("CUSTOMER"), createReview);
router.get("/my-reviews", authenticate, authorize("CUSTOMER"), getMyReviews);

// admin only
router.delete("/:id", authenticate, authorize("ADMIN"), deleteReview);

export default router;
