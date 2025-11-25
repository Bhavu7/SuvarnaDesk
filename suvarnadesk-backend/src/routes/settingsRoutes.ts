import { Router } from "express";
import {
    getShopSettings,
    updateShopSettings
} from "../controllers/settingsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getShopSettings);
router.put("/", authMiddleware, updateShopSettings);

export default router;