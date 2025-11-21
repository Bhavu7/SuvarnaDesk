import { Router } from 'express';
import { createCustomer, getCustomers } from '../controllers/customerController';
import { authMiddleware } from '../middleware/auth';
const router = Router();
router.post('/', authMiddleware, createCustomer);
router.get('/', authMiddleware, getCustomers);
export default router;
