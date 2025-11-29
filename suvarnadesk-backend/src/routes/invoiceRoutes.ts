// src/routes/invoiceRoutes.ts
import express from "express";
import {
    createInvoice,
    getInvoices,
    getInvoiceByNumber,
    getLatestInvoice,
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

// GET /api/invoices/latest - Get the latest invoice
router.get("/latest", getLatestInvoice);

export default router;