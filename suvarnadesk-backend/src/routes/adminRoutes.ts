// suvarnadesk-backend/src/routes/adminRoutes.ts
import { Router } from "express";
import {
    loginAdmin,
    registerAdmin,
    getAdminProfile,
    updateAdminProfile,
    changePassword,
    getShopSettings,
    updateShopSettings,
    verifyToken,
} from "../controllers/adminController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin); // Only initial setup
router.get("/profile", authMiddleware, getAdminProfile);
router.put("/profile", authMiddleware, updateAdminProfile);
router.patch("/change-password", authMiddleware, changePassword);

// Add the verify endpoint
router.get("/verify", authMiddleware, verifyToken);

// Shop Settings routes
router.get("/shop-settings", authMiddleware, getShopSettings);
router.put("/shop-settings", authMiddleware, updateShopSettings);

export default router;