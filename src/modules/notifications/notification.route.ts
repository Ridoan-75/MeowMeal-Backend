import { Router } from "express";
import { getMyNotifications, markAllRead } from "./notification.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, getMyNotifications);
router.patch("/read-all", authenticate, markAllRead);

export default router;