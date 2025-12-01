// src/routes/pdfRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { generateInvoicePDF, InvoicePDFData } from "../utils/pdfGenerator";
import Invoice from "../models/Invoice";
import ShopSettings from "../models/Settings";

const router = Router();

// Helper function to convert old GST structure to new CGST/SGST structure
const convertTotalsToNewStructure = (totals: any) => {
    if (totals.CGSTPercent !== undefined && totals.SGSTPercent !== undefined) {
        return totals;
    }

    if (totals.GSTPercent !== undefined) {
        const gstPercent = totals.GSTPercent / 2;
        const gstAmount = totals.GSTAmount / 2;

        return {
            subtotal: totals.subtotal,
            CGSTPercent: gstPercent,
            CGSTAmount: gstAmount,
            SGSTPercent: gstPercent,
            SGSTAmount: gstAmount,
            grandTotal: totals.grandTotal
        };
    }

    return {
        subtotal: totals.subtotal || 0,
        CGSTPercent: 1.5,
        CGSTAmount: 0,
        SGSTPercent: 1.5,
        SGSTAmount: 0,
        grandTotal: totals.grandTotal || 0
    };
};

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

        // Convert totals to new structure
        const convertedTotals = convertTotalsToNewStructure(invoiceObj.totals);

        // Determine which GST number to use based on items in the invoice
        const hasGoldItems = invoiceObj.lineItems.some((item: any) => item.itemType === 'gold');
        const hasSilverItems = invoiceObj.lineItems.some((item: any) => item.itemType === 'silver');

        let gstNumber = '';

        // Convert shopSettings to plain object to safely access properties
        if (shopSettings) {
            const shopSettingsObj = shopSettings.toObject();

            if (hasGoldItems && shopSettingsObj.goldGstNumber) {
                gstNumber = shopSettingsObj.goldGstNumber;
            } else if (hasSilverItems && shopSettingsObj.silverGstNumber) {
                gstNumber = shopSettingsObj.silverGstNumber;
            }
        }

        const pdfData: InvoicePDFData = {
            invoiceNumber: invoiceObj.invoiceNumber,
            date: invoiceObj.date,
            customerSnapshot: {
                name: invoiceObj.customerSnapshot.name,
                email: invoiceObj.customerSnapshot.email || "",
                phone: invoiceObj.customerSnapshot.phone,
                address: invoiceObj.customerSnapshot.address,
                huid: invoiceObj.customerSnapshot.huid
            },
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
                makingChargesTotal: item.makingChargesTotal,
                otherCharges: item.otherCharges || 0
            })),
            totals: convertedTotals,
            paymentDetails: invoiceObj.paymentDetails,
            shopSettings: shopSettings ? {
                shopName: shopSettings.shopName,
                address: shopSettings.address || "",
                phone: shopSettings.phone || "",
                gstNumber: gstNumber // Use the determined GST number
            } : undefined
        };

        generateInvoicePDF(pdfData, res);
    } catch (error) {
        console.error('PDF route error:', error);
        res.status(500).json({ error: "PDF generation failed" });
    }
});

export default router;