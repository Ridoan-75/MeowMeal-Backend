import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import categoryRoutes from "../modules/categories/category.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);

export default router;