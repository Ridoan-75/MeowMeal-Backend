import { Router } from "express";
import {
  getAllMeals,
  getMealById,
  getProviderMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  toggleMealAvailability,
} from "./meal.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// public routes
router.get("/", getAllMeals);
router.get("/:id", getMealById);
router.get("/provider/:providerId", getProviderMeals);

// provider only
router.post("/", authenticate, authorize("PROVIDER"), createMeal);
router.patch("/:id", authenticate, authorize("PROVIDER"), updateMeal);
router.delete("/:id", authenticate, authorize("PROVIDER"), deleteMeal);
router.patch(
  "/:id/toggle",
  authenticate,
  authorize("PROVIDER"),
  toggleMealAvailability,
);

export default router;
