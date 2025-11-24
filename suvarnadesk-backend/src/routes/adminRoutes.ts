import { Router } from "express";
import {
    loginAdmin,
    registerAdmin,
    getAdminProfile,
    updateAdminProfile,
} from "../controllers/adminController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/login", loginAdmin);

// Use /register only at first-time setup or via seeding script
router.post("/register", registerAdmin);

router.get("/profile", authMiddleware, getAdminProfile);
router.put("/profile", authMiddleware, updateAdminProfile);

export default router;
