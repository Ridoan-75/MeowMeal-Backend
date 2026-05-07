import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import categoryRoutes from "../modules/categories/category.route";
import mealRoutes from "../modules/meals/meal.route";
import orderRoutes from "../modules/orders/order.route";
import reviewRoutes from "../modules/reviews/review.route";
import cartRoutes from "../modules/cart/cart.routes";
import providerRoutes from "../modules/providers/provider.route";
import aiRoutes from "../modules/ai/ai.route";
import adminRoutes from "../modules/admin/admin.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/meals", mealRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/cart", cartRoutes);
router.use("/providers", providerRoutes);
router.use("/ai", aiRoutes);
router.use("/admin", adminRoutes);

export default router;