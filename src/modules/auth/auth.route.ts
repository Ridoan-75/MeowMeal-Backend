import { Router } from "express";
import { getMe, updateProfile, getAllUsers, toggleUserStatus, updateMe } from "./auth.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// protected routes
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateProfile);
router.patch("/me", authenticate, updateMe);

// admin only
router.get("/users", authenticate, authorize("ADMIN"), getAllUsers);
router.patch("/users/:id/status", authenticate, authorize("ADMIN"), toggleUserStatus);

export default router;