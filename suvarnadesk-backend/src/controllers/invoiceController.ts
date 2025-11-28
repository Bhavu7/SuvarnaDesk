import { Request, Response } from "express";
import Invoice from "../models/Invoice";

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
