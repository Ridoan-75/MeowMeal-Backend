import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// admin only
router.post("/", authenticate, authorize("ADMIN"), createCategory);
router.patch("/:id", authenticate, authorize("ADMIN"), updateCategory);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteCategory);

export default router;
