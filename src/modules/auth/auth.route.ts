import { Router } from "express";
import { getMe, updateProfile, getAllUsers, toggleUserStatus } from "./auth.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// protected routes
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateProfile);

// admin only
router.get("/users", authenticate, authorize("ADMIN"), getAllUsers);
router.patch("/users/:id/status", authenticate, authorize("ADMIN"), toggleUserStatus);

export default router;