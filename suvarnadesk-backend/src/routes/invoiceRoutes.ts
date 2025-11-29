// src/routes/invoiceRoutes.ts
import express from "express";
import {
    createInvoice,
    getInvoices,
    getInvoiceByNumber,
} from "../controllers/invoiceController";
import { downloadInvoicePDF } from "../controllers/invoiceController";

const router = express.Router();

// POST /api/invoices
router.post("/", createInvoice);

// GET /api/invoices
router.get("/", getInvoices);

// GET /api/invoices/:invoiceNumber
router.get("/:invoiceNumber", getInvoiceByNumber);

// GET /api/invoices/download/:invoiceNumber - PDF download route
router.get("/download/:invoiceNumber", downloadInvoicePDF);

export default router;