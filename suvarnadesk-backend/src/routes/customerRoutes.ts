// routes/customerRoutes.ts
import express from 'express';
import {
    getAllCustomers,
    getCustomerById,
    getCustomerByPhone,
    createCustomer,
    createOrUpdateCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomerStats,
    bulkImportCustomers,
} from '../controllers/customerController';
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Customer CRUD operations
router.get('/', authMiddleware, getAllCustomers);
router.get('/search', authMiddleware, searchCustomers);
router.get('/stats', authMiddleware, getCustomerStats);
router.get('/phone/:phone', authMiddleware, getCustomerByPhone);
router.get('/:id', authMiddleware, getCustomerById);
router.post('/', authMiddleware, createCustomer);
router.post('/upsert', authMiddleware, createOrUpdateCustomer); // Create or update based on phone
router.post('/bulk-import', authMiddleware, bulkImportCustomers);
router.put('/:id', authMiddleware, updateCustomer);
router.delete('/:id', authMiddleware, deleteCustomer);

export default router;