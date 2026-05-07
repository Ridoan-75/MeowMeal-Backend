import { Router } from "express";
import { getDashboardStats } from "./admin.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN"),
  getDashboardStats
);

export default router;