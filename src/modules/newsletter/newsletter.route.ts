import { Router } from "express";
import { subscribe, getAllSubscribers } from "./newsletter.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", subscribe);
router.get("/", authenticate, authorize("ADMIN"), getAllSubscribers);

export default router;