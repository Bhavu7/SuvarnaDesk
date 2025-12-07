// src/controllers/invoiceController.ts
import mongoose from "mongoose";
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
      downloadUrl,
    } = req.body;

    // Validate required fields
    if (!invoiceNumber || !customerSnapshot || !lineItems || !totals) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Validate line items
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one line item is required',
      });
    }

    // Validate totals structure
    if (!totals.subtotal || !totals.grandTotal) {
      return res.status(400).json({
        success: false,
        message: 'Invalid totals structure',
      });
    }

    // Save/update customer
    let customerId = null;
    if (customerSnapshot) {
      customerId = await saveCustomerFromInvoice({
        name: customerSnapshot.name,
        phone: customerSnapshot.phone,
        email: customerSnapshot.email,
        address: customerSnapshot.address,
        huid: customerSnapshot.huid,
        gstNumber: customerSnapshot.gstin,
      });
    }

    // Ensure totals have CGST/SGST structure
    const validatedTotals = {
      subtotal: totals.subtotal || 0,
      CGSTPercent: totals.CGSTPercent || 1.5,
      CGSTAmount: totals.CGSTAmount || 0,
      SGSTPercent: totals.SGSTPercent || 1.5,
      SGSTAmount: totals.SGSTAmount || 0,
      totalGST: totals.totalGST || (totals.CGSTAmount || 0) + (totals.SGSTAmount || 0),
      grandTotal: totals.grandTotal || 0,
    };

    // Create invoice object
    const invoiceData = {
      invoiceNumber,
      date,
      customerId: customerId || 'new-customer',
      customerSnapshot: {
        name: customerSnapshot.name,
        email: customerSnapshot.email || '',
        phone: customerSnapshot.phone,
        address: customerSnapshot.address || '',
        huid: customerSnapshot.huid || '',
        hsnCode: customerSnapshot.hsnCode || '',
        gstin: customerSnapshot.gstin || '',
        state: customerSnapshot.state || 'Gujarat',
      },
      lineItems: lineItems.map((item: any) => ({
        itemType: item.itemType || 'gold',
        purity: item.purity || '24K',
        description: item.description || '',
        weight: {
          value: item.weight?.value || 0,
          unit: item.weight?.unit || 'g',
        },
        ratePerGram: item.ratePerGram || 0,
        labourChargeReferenceId: item.labourChargeReferenceId || '',
        labourChargeType: item.labourChargeType || null,
        labourChargeAmount: item.labourChargeAmount || 0,
        makingChargesTotal: item.makingChargesTotal || 0,
        otherCharges: item.otherCharges || 0,
        itemTotal: item.itemTotal || 0,
      })),
      totals: validatedTotals,
      paymentDetails: {
        paymentMode: paymentDetails?.paymentMode || 'cash',
        amountPaid: paymentDetails?.amountPaid || 0,
        balanceDue: paymentDetails?.balanceDue || validatedTotals.grandTotal,
      },
      QRCodeData: QRCodeData || '',
      pdfData: pdfData || [],
      ratesSource: ratesSource || 'manual',
      gstInfo: gstInfo || {},
      downloadUrl: downloadUrl || '',
    };

    // Check for duplicate invoice number
    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number already exists',
        error: 'Duplicate invoice number',
      });
    }

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

    // Handle duplicate key error
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

// Auto-download endpoint with proper headers
export const downloadInvoicePDFAuto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceNumber } = req.params;
    const { auto } = req.query; // Check for auto-download flag

    // Find invoice by number
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      // Return 404 with HTML for better user experience
      res.status(404).send(`
        <html>
          <head>
            <title>Invoice Not Found</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              h1 { color: #ff4444; }
              p { color: #666; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>Invoice Not Found</h1>
            <p>Invoice ${invoiceNumber} does not exist.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>
      `);
      return;
    }

    // Convert totals to new structure if needed
    const convertTotals = (totals: any) => {
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

    const invoiceObj = invoice.toObject();
    const convertedTotals = convertTotals(invoiceObj.totals);

    // Check user agent for mobile/desktop
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());

    // Get shop settings for GST numbers
    const shopSettings = await mongoose.model('ShopSettings').findOne();
    const shopSettingsObj = shopSettings ? shopSettings.toObject() : null;

    // Determine GST number based on items
    const hasGoldItems = invoiceObj.lineItems.some((item: any) => item.itemType === 'gold');
    const hasSilverItems = invoiceObj.lineItems.some((item: any) => item.itemType === 'silver');

    let gstNumber = '';
    if (shopSettingsObj) {
      if (hasGoldItems && shopSettingsObj.goldGstNumber) {
        gstNumber = shopSettingsObj.goldGstNumber;
      } else if (hasSilverItems && shopSettingsObj.silverGstNumber) {
        gstNumber = shopSettingsObj.silverGstNumber;
      }
    }

    // If it's a direct request (QR scan) with auto flag, redirect to auto-download page
    if (auto === '1' || req.query.auto === '1') {
      // Render an HTML page that auto-triggers download
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Downloading Invoice ${invoiceNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              padding: 40px;
              max-width: 500px;
              width: 90%;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            h1 {
              font-size: 28px;
              margin-bottom: 20px;
            }
            .loading {
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 30px 0;
            }
            .spinner {
              width: 50px;
              height: 50px;
              border: 5px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top-color: white;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .button {
              display: inline-block;
              background: white;
              color: #667eea;
              padding: 15px 30px;
              border-radius: 50px;
              text-decoration: none;
              font-weight: bold;
              margin-top: 20px;
              transition: transform 0.3s, box-shadow 0.3s;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            .button:hover {
              transform: translateY(-3px);
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            .info {
              font-size: 14px;
              margin-top: 20px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📄 Invoice ${invoiceNumber}</h1>
            <p>Your invoice is being downloaded...</p>
            
            <div class="loading">
              <div class="spinner"></div>
            </div>
            
            <div id="status">Preparing download...</div>
            
            <div class="info">
              If download doesn't start automatically, click below:
            </div>
            
            <a href="/api/invoices/download-direct/${invoiceNumber}" class="button" download>
              📥 Download Invoice Now
            </a>
            
            <div class="info">
              Customer: ${invoiceObj.customerSnapshot.name}<br>
              Date: ${new Date(invoiceObj.date).toLocaleDateString()}<br>
              Total: ₹${convertedTotals.grandTotal.toFixed(2)}
            </div>
          </div>
          
          <script>
            // Auto-start download after a short delay
            setTimeout(() => {
              document.getElementById('status').innerHTML = 'Starting download...';
              window.location.href = '/api/invoices/download-direct/${invoiceNumber}';
            }, 1500);
            
            // Fallback download after 5 seconds
            setTimeout(() => {
              const link = document.querySelector('.button');
              if (!document.querySelector('.downloaded')) {
                document.getElementById('status').innerHTML = 'Click the button below to download';
                link.style.animation = 'pulse 1s infinite';
              }
            }, 5000);
            
            // Detect if download started
            let downloadAttempted = false;
            window.addEventListener('blur', () => {
              if (!downloadAttempted) {
                downloadAttempted = true;
                document.getElementById('status').innerHTML = '✅ Download started!';
                document.querySelector('.button').classList.add('downloaded');
              }
            });
          </script>
        </body>
        </html>
      `;

      res.send(html);
      return;
    }

    // If it's a direct download request (from the button or auto-trigger)
    const filename = `Invoice_${invoiceNumber}_${invoiceObj.customerSnapshot.name.replace(/\s+/g, '_')}.pdf`;

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // For mobile devices, add additional headers
    if (isMobile) {
      res.setHeader('Content-Transfer-Encoding', 'binary');
      res.setHeader('Accept-Ranges', 'bytes');
    }

    // Generate and stream PDF
    const pdfData = {
      invoiceNumber: invoiceObj.invoiceNumber,
      date: invoiceObj.date,
      customerSnapshot: {
        name: invoiceObj.customerSnapshot.name,
        email: invoiceObj.customerSnapshot.email || "",
        phone: invoiceObj.customerSnapshot.phone,
        address: invoiceObj.customerSnapshot.address || "",
        huid: invoiceObj.customerSnapshot.huid || ""
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
      shopSettings: shopSettingsObj ? {
        shopName: shopSettingsObj.shopName || "JEWELRY COMMERCIAL INVOICE",
        address: shopSettingsObj.address || "",
        phone: shopSettingsObj.phone || "",
        gstNumber: gstNumber
      } : {
        shopName: "JEWELRY COMMERCIAL INVOICE",
        address: "",
        phone: "",
        gstNumber: ""
      }
    };

    // Generate PDF
    generateInvoicePDF(pdfData, res);

  } catch (error) {
    console.error('Download error:', error);

    // User-friendly error page
    res.status(500).send(`
      <html>
        <head>
          <title>Download Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #ff4444; }
            p { color: #666; margin: 20px 0; }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 24px;
              border-radius: 5px;
              text-decoration: none;
              margin: 10px;
            }
          </style>
        </head>
        <body>
          <h1>⚠️ Download Failed</h1>
          <p>Unable to download the invoice at this time.</p>
          <p>Please try again later or contact support.</p>
          <div>
            <a href="/api/invoices/download/${req.params.invoiceNumber}?auto=1" class="button">
              Try Again
            </a>
            <a href="/" class="button">
              Return Home
            </a>
          </div>
        </body>
      </html>
    `);
  }
};