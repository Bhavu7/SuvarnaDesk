import { Router } from "express";
import {
    createCustomer,
    getCustomers,
    updateCustomer,
    deleteCustomer,
} from "../controllers/customerController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, createCustomer);
router.get("/", authMiddleware, getCustomers);
router.put("/:id", authMiddleware, updateCustomer);
router.delete("/:id", authMiddleware, deleteCustomer);

export default router;
