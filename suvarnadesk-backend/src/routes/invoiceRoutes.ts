import { Router } from 'express';
import { createInvoice, getInvoices } from '../controllers/invoiceController';
import { authMiddleware } from '../middleware/auth';
const router = Router();
router.post('/', authMiddleware, createInvoice);
router.get('/', authMiddleware, getInvoices);
export default router;
