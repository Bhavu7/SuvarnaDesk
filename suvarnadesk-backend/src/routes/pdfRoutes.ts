import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import Invoice from "../models/Invoice";

const router = Router();

router.get("/invoices/:id/pdf", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id).populate("customerId");

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        generateInvoicePDF(invoice, res);
    } catch (error) {
        res.status(500).json({ error: "PDF generation failed" });
    }
});

export default router;