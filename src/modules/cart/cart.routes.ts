import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "./cart.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// customer only
router.get("/", authenticate, authorize("CUSTOMER"), getCart);
router.post("/", authenticate, authorize("CUSTOMER"), addToCart);
router.patch("/:itemId", authenticate, authorize("CUSTOMER"), updateCartItem);
router.delete("/:itemId", authenticate, authorize("CUSTOMER"), removeFromCart);
router.delete("/", authenticate, authorize("CUSTOMER"), clearCart);

export default router;