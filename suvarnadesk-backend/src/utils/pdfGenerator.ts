import PDFDocument from "pdfkit";
import { Response } from "express";

export function generateInvoicePDF(invoiceData: any, res: Response) {
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoiceNumber}`);
    doc.text(`Date: ${invoiceData.date}`);
    doc.text(`Customer: ${invoiceData.customerSnapshot?.name}`);
    doc.text(`Phone: ${invoiceData.customerSnapshot?.phone}`);
    doc.moveDown();

    doc.fontSize(14).text("Items:");
    invoiceData.lineItems.forEach((item: any, idx: number) => {
        doc.fontSize(12)
            .text(
                `${idx + 1}. ${item.itemType} (${item.purity}) | Weight: ${item.weight.value}${item.weight.unit} | Total: ₹${item.itemTotal}`
            );
    });

    doc.moveDown();
    doc.text(`Subtotal: ₹${invoiceData.totals.subtotal}`);
    doc.text(`GST: ₹${invoiceData.totals.GSTAmount}`);
    doc.text(`Grand Total: ₹${invoiceData.totals.grandTotal}`);
    doc.text(`Amount Paid: ₹${invoiceData.paymentDetails.amountPaid}`);
    doc.text(`Balance Due: ₹${invoiceData.paymentDetails.balanceDue}`);

    doc.end();
}
