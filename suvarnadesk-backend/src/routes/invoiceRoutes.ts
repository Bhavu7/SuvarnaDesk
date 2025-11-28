import express from "express";
import {
    createInvoice,
    getInvoices,
    getInvoiceByNumber,
} from "../controllers/invoiceController";

const router = express.Router();

// POST /api/invoices
router.post("/", createInvoice);

// GET /api/invoices
router.get("/", getInvoices);

// GET /api/invoices/:invoiceNumber
router.get("/:invoiceNumber", getInvoiceByNumber);

export default router;
