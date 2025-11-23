import Invoice from "../models/Invoice";
import { Request, Response } from "express";

// POST /api/invoices
export const createInvoice = async (req: Request, res: Response) => {
  const invoiceData = req.body;
  const invoice = new Invoice({ ...invoiceData, createdBy: (req as any).admin.adminId });
  await invoice.save();
  res.status(201).json(invoice);
};

// GET /api/invoices
export const getInvoices = async (req: Request, res: Response) => {
  const invoices = await Invoice.find().populate("customerId").populate("createdBy");
  res.json(invoices);
};

// GET /api/invoices/:id
export const getInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const invoice = await Invoice.findById(id).populate("customerId").populate("createdBy");
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  res.json(invoice);
};

// PUT /api/invoices/:id
export const updateInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const invoiceData = req.body;
  const invoice = await Invoice.findByIdAndUpdate(id, invoiceData, { new: true });
  res.json(invoice);
};

// DELETE /api/invoices/:id
export const deleteInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Invoice.findByIdAndDelete(id);
  res.json({ message: "Invoice deleted" });
};
