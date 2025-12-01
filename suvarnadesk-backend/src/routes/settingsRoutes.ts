import express from "express";
import {
    getShopSettings,
    updateShopSettings,
    createInitialSettings
} from "../controllers/settingsController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// GET /api/shop-settings - Get current shop settings
router.get("/", authMiddleware, getShopSettings);

// PUT /api/shop-settings - Update shop settings
router.put("/", authMiddleware, updateShopSettings);

// POST /api/shop-settings - Create initial shop settings (optional)
router.post("/", authMiddleware, createInitialSettings);

export default router;