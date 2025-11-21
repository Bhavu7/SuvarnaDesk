import Invoice from '../models/Invoice';
import { Request, Response } from 'express';

export const createInvoice = async (req: Request, res: Response) => {
  const invoice = new Invoice(req.body);
  await invoice.save();
  res.status(201).json(invoice);
};

export const getInvoices = async (req: Request, res: Response) => {
  const invoices = await Invoice.find({});
  res.json(invoices);
};
