import PDFDocument from 'pdfkit';
import { Response } from 'express';
export const createInvoicePDF = (invoice: any, res: Response) => {
    const doc = new PDFDocument();
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    // Format PDF with other invoice details
    doc.pipe(res);
    doc.end();
};
