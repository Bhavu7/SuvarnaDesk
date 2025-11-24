import { Router } from "express";
import {
    loginAdmin,
    registerAdmin,
    getAdminProfile,
    updateAdminProfile,
    changePassword,
} from "../controllers/adminController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin); // Only initial setup
router.get("/profile", authMiddleware, getAdminProfile);
router.put("/profile", authMiddleware, updateAdminProfile);
router.patch("/change-password", authMiddleware, changePassword);

export default router;
