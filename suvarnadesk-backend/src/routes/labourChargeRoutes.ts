import { Router } from "express";
import {
    getLabourCharges,
    createLabourCharge,
    updateLabourCharge,
    deleteLabourCharge
} from "../controllers/labourChargeController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getLabourCharges);
router.post("/", authMiddleware, createLabourCharge);
router.put("/:id", authMiddleware, updateLabourCharge);
router.delete("/:id", authMiddleware, deleteLabourCharge);

export default router;