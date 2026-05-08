import { Router } from "express";
import {
  toggleWishlist,
  getMyWishlist,
  checkWishlist,
  getWishlistCount,
} from "./wishlist.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.get("/", getMyWishlist);
router.get("/count", getWishlistCount);
router.get("/check/:mealId", checkWishlist);
router.post("/toggle/:mealId", toggleWishlist);

export default router;