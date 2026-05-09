import { Router } from "express";
import {
  getAllProviders,
  getProviderById,
  getMyProfile,
  createProviderProfile,
  updateProviderProfile,
  toggleOpenStatus,
  verifyProvider,
  getDashboardStats,
  toggleProviderBan,
  deleteProvider,
} from "./provider.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// public
router.get("/", getAllProviders);
router.get("/:id", getProviderById);

// provider only
router.get("/me/profile", authenticate, authorize("PROVIDER"), getMyProfile);
router.post(
  "/me/profile",
  authenticate,
  authorize("PROVIDER"),
  createProviderProfile,
);
router.patch(
  "/me/profile",
  authenticate,
  authorize("PROVIDER"),
  updateProviderProfile,
);
router.patch(
  "/me/toggle-status",
  authenticate,
  authorize("PROVIDER"),
  toggleOpenStatus,
);
router.get(
  "/me/dashboard",
  authenticate,
  authorize("PROVIDER"),
  getDashboardStats,
);
router.patch("/:id/ban", authenticate, authorize("ADMIN"), toggleProviderBan);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteProvider);
// admin only
router.patch("/:id/verify", authenticate, authorize("ADMIN"), verifyProvider);

export default router;
