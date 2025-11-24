import { Router } from "express";
import {
    getWorkerJobs,
    createWorkerJob,
    updateWorkerJob
} from "../controllers/workerJobController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getWorkerJobs);
router.post("/", authMiddleware, createWorkerJob);
router.put("/:id", authMiddleware, updateWorkerJob);

export default router;