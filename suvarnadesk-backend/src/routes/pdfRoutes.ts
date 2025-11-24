import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { generateInvoicePDF, InvoicePDFData } from "../utils/pdfGenerator";
import Invoice from "../models/Invoice";
import ShopSettings from "../models/ShopSettings";

const router = Router();

router.get("/invoices/:id/pdf", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        // Get shop settings for the PDF header
        const shopSettings = await ShopSettings.findOne();

        // Convert Mongoose document to plain object and transform for PDF
        const invoiceObj = invoice.toObject();

        const pdfData: InvoicePDFData = {
            invoiceNumber: invoiceObj.invoiceNumber,
            date: invoiceObj.date.toISOString(),
            customerSnapshot: invoiceObj.customerSnapshot,
            lineItems: invoiceObj.lineItems.map((item: any) => ({
                itemType: item.itemType,
                description: item.description,
                purity: item.purity,
                weight: {
                    value: item.weight.value,
                    unit: item.weight.unit
                },
                ratePerGram: item.ratePerGram,
                itemTotal: item.itemTotal,
                makingChargesTotal: item.makingChargesTotal
            })),
            totals: invoiceObj.totals,
            paymentDetails: invoiceObj.paymentDetails,
            shopSettings: shopSettings ? {
                shopName: shopSettings.shopName,
                address: shopSettings.address,
                phone: shopSettings.phone,
                gstNumber: shopSettings.gstNumber
            } : undefined
        };

        generateInvoicePDF(pdfData, res);
    } catch (error) {
        console.error('PDF route error:', error);
        res.status(500).json({ error: "PDF generation failed" });
    }
});

export default router;