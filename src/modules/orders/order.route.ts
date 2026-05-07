import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getProviderOrders,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} from "./order.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// customer routes
router.post("/", authenticate, authorize("CUSTOMER"), createOrder);
router.get("/my-orders", authenticate, authorize("CUSTOMER"), getMyOrders);
router.patch("/:id/cancel", authenticate, authorize("CUSTOMER"), cancelOrder);

// provider routes
router.get(
  "/provider-orders",
  authenticate,
  authorize("PROVIDER"),
  getProviderOrders,
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("PROVIDER"),
  updateOrderStatus,
);

// shared route
router.get("/:id", authenticate, getOrderById);

// admin routes
router.get("/", authenticate, authorize("ADMIN"), getAllOrders);

export default router;
