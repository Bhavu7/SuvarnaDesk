// src/controllers/invoiceController.ts
import { Request, Response } from "express";
import Invoice from "../models/Invoice";
import ShopSettings from "../models/Settings";
import { generateInvoicePDF, InvoicePDFData } from "../utils/pdfGenerator";

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.create(req.body);
    return res.status(201).json(invoice);
  } catch (err: any) {
    console.error("Create invoice error", err);
    return res
      .status(400)
      .json({ error: err.message || "Failed to create invoice" });
  }
};

export const getInvoices = async (_req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    return res.json(invoices);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch invoices" });
  }
};

export const getInvoiceByNumber = async (req: Request, res: Response) => {
  try {
    const { invoiceNumber } = req.params;
    const invoice = await Invoice.findOne({ invoiceNumber });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    return res.json(invoice);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch invoice" });
  }
};

// Helper function to convert old GST structure to new CGST/SGST structure
const convertTotalsToNewStructure = (totals: any) => {
  // If already in new structure, return as is
  if (totals.CGSTPercent !== undefined && totals.SGSTPercent !== undefined) {
    return totals;
  }

  // Convert from old GST structure to new CGST/SGST structure
  if (totals.GSTPercent !== undefined) {
    const gstPercent = totals.GSTPercent / 2; // Split 3% GST into 1.5% CGST + 1.5% SGST
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

  // Default structure if neither old nor new format is found
  return {
    subtotal: totals.subtotal || 0,
    CGSTPercent: 1.5,
    CGSTAmount: 0,
    SGSTPercent: 1.5,
    SGSTAmount: 0,
    grandTotal: totals.grandTotal || 0
  };
};

export const downloadInvoicePDF = async (req: Request, res: Response) => {
  try {
    const { invoiceNumber } = req.params;
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Get shop settings
    const shopSettings = await ShopSettings.findOne();

    // Convert Mongoose document to plain object and transform for PDF
    const invoiceObj = invoice.toObject();

    // Convert totals to new structure (handles both old and new data)
    const convertedTotals = convertTotalsToNewStructure(invoiceObj.totals);

    const pdfData: InvoicePDFData = {
      invoiceNumber: invoiceObj.invoiceNumber,
      date: invoiceObj.date,
      customerSnapshot: {
        name: invoiceObj.customerSnapshot.name,
        email: invoiceObj.customerSnapshot.email || "",
        phone: invoiceObj.customerSnapshot.phone,
        address: invoiceObj.customerSnapshot.address,
        huid: invoiceObj.customerSnapshot.huid,
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
        otherCharges: item.otherCharges || 0,
      })),
      totals: convertedTotals, // Use converted totals
      paymentDetails: invoiceObj.paymentDetails,
      shopSettings: shopSettings ? {
        shopName: shopSettings.shopName,
        address: shopSettings.address || "",
        phone: shopSettings.phone || "",
        gstNumber: shopSettings.gstNumber
      } : {
        shopName: "JEWELRY COMMERCIAL INVOICE",
        address: "",
        phone: "",
        gstNumber: ""
      }
    };

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNumber}.pdf"`);

    // Generate and send PDF
    generateInvoicePDF(pdfData, res);
  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ error: "PDF generation failed" });
  }
};