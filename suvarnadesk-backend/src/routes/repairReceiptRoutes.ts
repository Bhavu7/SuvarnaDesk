import express from 'express';
import {
    createRepairReceipt,
    getRepairReceipts,
    getRepairReceiptById,
    updateRepairReceipt,
    deleteRepairReceipt,
    getReceiptStats
} from '../controllers/repairReceiptController';

const router = express.Router();

// Create a new repair receipt
router.post('/', createRepairReceipt);

// Get all repair receipts with pagination and filters
router.get('/', getRepairReceipts);

// Get receipt statistics
router.get('/stats', getReceiptStats);

// Get a single repair receipt by ID
router.get('/:id', getRepairReceiptById);

// Update a repair receipt
router.put('/:id', updateRepairReceipt);

// Delete a repair receipt
router.delete('/:id', deleteRepairReceipt);

export default router;