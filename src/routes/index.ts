import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import categoryRoutes from "../modules/categories/category.route";
import mealRoutes from "../modules/meals/meal.route";
import orderRoutes from "../modules/orders/order.route";
import reviewRoutes from "../modules/reviews/review.route";
import cartRoutes from "../modules/cart/cart.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/meals", mealRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/cart", cartRoutes);

export default router;