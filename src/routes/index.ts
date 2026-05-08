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
import newsletterRoutes from "../modules/newsletter/newsletter.route";
import wishlistRoutes from "../modules/wishlist/wishlist.route";
import multer from "multer";
import { uploadFile } from "../modules/uploads/upload.controller";
import { authenticate } from "../middlewares/auth.middleware";


const upload = multer({ storage: multer.memoryStorage() });
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
router.use("/newsletter", newsletterRoutes);
router.use("/wishlist", wishlistRoutes);
router.post("/upload", authenticate, upload.single("file"), uploadFile);

export default router;