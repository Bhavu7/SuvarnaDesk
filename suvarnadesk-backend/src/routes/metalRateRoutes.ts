import { Router } from "express";
import {
    getMetalRates,
    createMetalRate,
    getCurrentRates
} from "../controllers/metalRateController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getMetalRates);
router.get("/current", authMiddleware, getCurrentRates);
router.post("/", authMiddleware, createMetalRate);

export default router;