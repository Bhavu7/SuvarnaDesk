// src/controllers/invoiceController.ts
import { Request, Response } from "express";
import Invoice from "../models/Invoice";
import ShopSettings from "../models/Settings";
import Customer from '../models/Customer';
import { generateInvoicePDF, InvoicePDFData } from "../utils/pdfGenerator";

// Helper function to update customer purchase stats
const updateCustomerPurchaseStats = async (customerId: string, purchaseAmount: number) => {
  try {
    const customer = await Customer.findById(customerId);

    if (customer) {
      customer.totalPurchases += 1;
      customer.totalAmountSpent += purchaseAmount;
      customer.lastPurchaseDate = new Date();

      await customer.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating customer stats:', error);
    return false;
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

// Helper function to save customer from invoice data
const saveCustomerFromInvoice = async (customerData: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  huid?: string;
  gstNumber?: string;
}) => {
  try {
    const { name, phone, email, address, huid, gstNumber } = customerData;

    if (!name || !phone) {
      return null;
    }

    // Check if customer exists
    const existingCustomer = await Customer.findOne({ phone });

    if (existingCustomer) {
      // Update customer if new information is provided
      const updates: any = {};
      if (email && email !== existingCustomer.email) updates.email = email;
      if (address && address !== existingCustomer.address) updates.address = address;
      if (huid && huid !== existingCustomer.huid) updates.huid = huid;
      if (gstNumber && gstNumber !== existingCustomer.gstNumber) updates.gstNumber = gstNumber;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        const updatedCustomer = await Customer.findByIdAndUpdate(
          existingCustomer._id,
          updates,
          { new: true }
        );
        return updatedCustomer?._id.toString() || null;
      }
      return existingCustomer._id.toString();
    } else {
      // Create new customer
      const newCustomer = new Customer({
        name,
        phone,
        email,
        address,
        huid,
        gstNumber,
        totalPurchases: 0,
        totalAmountSpent: 0,
      });
      await newCustomer.save();
      return newCustomer._id.toString();
    }
  } catch (error) {
    console.error('Error saving customer from invoice:', error);
    return null;
  }
};

// Create invoice
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const {
      invoiceNumber,
      date,
      customerSnapshot,
      lineItems,
      totals,
      paymentDetails,
      QRCodeData,
      pdfData,
      ratesSource,
      gstInfo,
    } = req.body;

    // Validate required fields
    if (!invoiceNumber || !customerSnapshot || !lineItems || !totals) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Save/update customer
    let customerId = null;
    if (customerSnapshot) {
      customerId = await saveCustomerFromInvoice(customerSnapshot);
    }

    // Create invoice with customerId
    const invoiceData = {
      invoiceNumber,
      date,
      customerId: customerId || 'new-customer',
      customerSnapshot,
      lineItems,
      totals,
      paymentDetails,
      QRCodeData,
      pdfData,
      ratesSource,
      gstInfo,
    };

    // Save invoice
    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Update customer stats if customer exists
    if (customerId) {
      await updateCustomerPurchaseStats(customerId, invoice.totals.grandTotal);
    }

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error: any) {
    console.error('Error creating invoice:', error);

    // Handle duplicate invoice number error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number already exists',
        error: 'Duplicate invoice number',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating invoice',
      error: error.message,
    });
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

export const downloadInvoicePDF = async (req: Request, res: Response) => {
  try {
    const { invoiceNumber } = req.params;
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Get shop settings
    const shopSettings = await ShopSettings.findOne();

    // Convert Mongoose document to plain object
    const invoiceObj = invoice.toObject();
    const shopSettingsObj = shopSettings ? shopSettings.toObject() : null;

    // Convert totals to new structure (handles both old and new data)
    const convertedTotals = convertTotalsToNewStructure(invoiceObj.totals);

    // Use appropriate GST number based on items in the invoice
    const hasGoldItems = invoiceObj.lineItems.some((item: any) => item.itemType === 'gold');
    const hasSilverItems = invoiceObj.lineItems.some((item: any) => item.itemType === 'silver');

    let gstNumber = '';
    let shopName = shopSettingsObj?.shopName || "JEWELRY COMMERCIAL INVOICE";

    if (hasGoldItems && shopSettingsObj?.goldGstNumber) {
      gstNumber = shopSettingsObj.goldGstNumber;
    } else if (hasSilverItems && shopSettingsObj?.silverGstNumber) {
      gstNumber = shopSettingsObj.silverGstNumber;
    }

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
      totals: convertedTotals,
      paymentDetails: invoiceObj.paymentDetails,
      shopSettings: {
        shopName,
        address: shopSettingsObj?.address || "",
        phone: shopSettingsObj?.phone || "",
        gstNumber,
      }
    };

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNumber}.pdf"`);

    // Generate and send PDF
    generateInvoicePDF(pdfData, res);
  } catch (error: any) {
    console.error('PDF download error:', error);
    res.status(500).json({ error: "PDF generation failed" });
  }
};

export const getLatestInvoice = async (_req: Request, res: Response) => {
  try {
    const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    return res.json({
      invoiceNumber: latestInvoice?.invoiceNumber || null
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch latest invoice" });
  }
};

// Get invoices by customer phone
export const getInvoicesByCustomerPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;

    const invoices = await Invoice.find({ 'customerSnapshot.phone': phone })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error: any) {
    console.error('Error fetching customer invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer invoices',
      error: error.message,
    });
  }
};

// Get invoice statistics
export const getInvoiceStats = async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get counts
    const totalInvoices = await Invoice.countDocuments();
    const todayInvoices = await Invoice.countDocuments({
      createdAt: { $gte: today }
    });
    const monthlyInvoices = await Invoice.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const yearlyInvoices = await Invoice.countDocuments({
      createdAt: { $gte: startOfYear }
    });

    // Get revenue
    const invoices = await Invoice.find();
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totals.grandTotal, 0);

    // Monthly revenue
    const monthlyInvoicesData = await Invoice.find({ createdAt: { $gte: startOfMonth } });
    const monthlyRevenue = monthlyInvoicesData.reduce((sum, invoice) => sum + invoice.totals.grandTotal, 0);

    res.json({
      success: true,
      data: {
        counts: {
          total: totalInvoices,
          today: todayInvoices,
          monthly: monthlyInvoices,
          yearly: yearlyInvoices,
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
        },
        paymentMethods: {
          cash: invoices.filter(i => i.paymentDetails.paymentMode === 'cash').length,
          upi: invoices.filter(i => i.paymentDetails.paymentMode === 'upi').length,
          card: invoices.filter(i => i.paymentDetails.paymentMode === 'card').length,
          other: invoices.filter(i => !['cash', 'upi', 'card'].includes(i.paymentDetails.paymentMode)).length,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice statistics',
      error: error.message,
    });
  }
};