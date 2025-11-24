import { Router } from "express";
import {
    loginAdmin,
    registerAdmin,
    getAdminProfile,
    updateAdminProfile,
} from "../controllers/adminController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Admin authentication endpoints
router.post("/login", loginAdmin);

// Use /register only for first-time setup or via seed script
router.post("/register", registerAdmin);

// Admin profile (GET, PUT)
router.get("/profile", authMiddleware, getAdminProfile);
router.put("/profile", authMiddleware, updateAdminProfile);

export default router;
