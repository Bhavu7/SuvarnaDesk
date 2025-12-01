// routes/adminRoutes.ts - Update existing routes
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
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getAdminStats
} from "../controllers/adminController";
import { authMiddleware } from "../middleware/auth";
import { checkAdminLimit } from "../middleware/adminLimit";

const router = Router();

// Public routes
router.post("/login", loginAdmin);
router.post("/register", checkAdminLimit, registerAdmin); // Only initial setup
router.get("/stats", getAdminStats);

// Protected routes
router.get("/verify", authMiddleware, verifyToken);
router.get("/profile", authMiddleware, getAdminProfile);
router.put("/profile", authMiddleware, updateAdminProfile);
router.patch("/change-password", authMiddleware, changePassword);

// Admin management routes (super_admin only)
router.get("/all", authMiddleware, getAllAdmins);
router.post("/create", authMiddleware, checkAdminLimit, createAdmin);
router.put("/:id", authMiddleware, updateAdmin);
router.delete("/:id", authMiddleware, deleteAdmin);

// Shop Settings routes
router.get("/shop-settings", authMiddleware, getShopSettings);
router.put("/shop-settings", authMiddleware, updateShopSettings);

export default router;