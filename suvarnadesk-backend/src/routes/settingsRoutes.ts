import express from "express";
import {
    getShopSettings,
    updateShopSettings
} from "../controllers/settingsController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// GET /api/shop-settings
router.get("/", authMiddleware, getShopSettings);

// PUT /api/shop-settings
router.put("/", authMiddleware, updateShopSettings);

export default router;