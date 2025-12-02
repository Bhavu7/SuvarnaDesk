// src/routes/invoiceRoutes.ts
import express from "express";
import {
    createInvoice,
    getInvoices,
    getInvoiceByNumber,
    getLatestInvoice,
    downloadInvoicePDF,
    downloadInvoicePDFAuto
} from "../controllers/invoiceController";

const router = express.Router();

// POST /api/invoices
router.post("/", createInvoice);

// GET /api/invoices
router.get("/", getInvoices);

// GET /api/invoices/:invoiceNumber
router.get("/:invoiceNumber", getInvoiceByNumber);

// GET /api/invoices/download/:invoiceNumber - PDF download route
router.get("/download/:invoiceNumber", downloadInvoicePDF);

// GET /api/invoices/download/:invoiceNumber?auto=1 - PDF auto-download route
router.get("/download/:invoiceNumber", downloadInvoicePDFAuto);

// GET /api/invoices/latest - Get the latest invoice
router.get("/latest", getLatestInvoice);

export default router;