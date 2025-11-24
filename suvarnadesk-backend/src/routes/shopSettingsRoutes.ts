import { Router } from "express";
import {
    getShopSettings,
    updateShopSettings
} from "../controllers/shopSettingsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getShopSettings);
router.put("/", authMiddleware, updateShopSettings);

export default router;