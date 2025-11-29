// src/utils/pdfGenerator.ts
import PDFDocument from 'pdfkit';
import { Response } from 'express';

// Updated interface to match your new structure
export interface InvoicePDFData {
    invoiceNumber: string;
    date: string | Date;
    customerSnapshot: {
        name: string;
        email: string;
        phone: string;
        address?: string;
        huid?: string;
    };
    lineItems: Array<{
        itemType: string;
        description: string;
        purity: string;
        weight: {
            value: number;
            unit: string;
        };
        ratePerGram: number;
        itemTotal: number;
        makingChargesTotal?: number;
        otherCharges?: number;
    }>;
    totals: {
        subtotal: number;
        CGSTPercent: number;
        CGSTAmount: number;
        SGSTPercent: number;
        SGSTAmount: number;
        grandTotal: number;
    };
    paymentDetails: {
        paymentMode: string;
        amountPaid: number;
        balanceDue: number;
    };
    shopSettings?: {
        shopName: string;
        address: string;
        phone: string;
        gstNumber?: string;
    };
}

export function generateInvoicePDF(invoiceData: InvoicePDFData, res: Response): void {
    try {
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="invoice-${invoiceData.invoiceNumber}.pdf"`);

        doc.pipe(res);

        // Header Section
        doc.fontSize(20).font('Helvetica-Bold')
            .text(invoiceData.shopSettings?.shopName || 'JEWELRY SHOP', { align: 'center' });

        doc.fontSize(10).font('Helvetica')
            .text(invoiceData.shopSettings?.address || '', { align: 'center' });
        doc.text(`Phone: ${invoiceData.shopSettings?.phone || ''}`, { align: 'center' });

        if (invoiceData.shopSettings?.gstNumber) {
            doc.text(`GST: ${invoiceData.shopSettings.gstNumber}`, { align: 'center' });
        }

        doc.moveDown();

        // Invoice Title
        doc.fontSize(16).font('Helvetica-Bold')
            .text('TAX INVOICE', { align: 'center' });
        doc.moveDown();

        // Invoice Details
        const invoiceDate = typeof invoiceData.date === 'string'
            ? new Date(invoiceData.date)
            : invoiceData.date;

        doc.fontSize(10).font('Helvetica')
            .text(`Invoice Number: ${invoiceData.invoiceNumber}`, { continued: true })
            .text(`Date: ${invoiceDate.toLocaleDateString()}`, { align: 'right' });

        doc.moveDown();

        // Customer Details
        doc.fontSize(12).font('Helvetica-Bold').text('Customer Details:');
        doc.fontSize(10).font('Helvetica')
            .text(`Name: ${invoiceData.customerSnapshot.name}`)
            .text(`Phone: ${invoiceData.customerSnapshot.phone}`)
            .text(`Email: ${invoiceData.customerSnapshot.email}`);

        if (invoiceData.customerSnapshot.huid) {
            doc.text(`HUID: ${invoiceData.customerSnapshot.huid}`);
        }

        if (invoiceData.customerSnapshot.address) {
            doc.text(`Address: ${invoiceData.customerSnapshot.address}`);
        }

        doc.moveDown();

        // Line Items Table
        const tableTop = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Description', 50, tableTop, { width: 200 });
        doc.text('Weight', 260, tableTop);
        doc.text('Rate/Gram', 320, tableTop);
        doc.text('Amount', 400, tableTop, { width: 100, align: 'right' });

        // Line Items
        let yPosition = tableTop + 20;
        doc.fontSize(9).font('Helvetica');

        invoiceData.lineItems.forEach((item, index) => {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }

            const description = `${item.itemType} ${item.purity} - ${item.description}`;

            doc.text(description, 50, yPosition, { width: 200 });
            doc.text(`${item.weight.value} ${item.weight.unit}`, 260, yPosition);
            doc.text(`₹${item.ratePerGram.toFixed(2)}`, 320, yPosition);
            doc.text(`₹${item.itemTotal.toFixed(2)}`, 400, yPosition, { width: 100, align: 'right' });

            yPosition += 20;
        });

        // Totals Section
        const totalsY = Math.max(yPosition + 20, 650);
        doc.fontSize(10).font('Helvetica-Bold');

        doc.text('Subtotal:', 350, totalsY);
        doc.text(`₹${invoiceData.totals.subtotal.toFixed(2)}`, 400, totalsY, { width: 100, align: 'right' });

        doc.text(`CGST (${invoiceData.totals.CGSTPercent}%):`, 350, totalsY + 15);
        doc.text(`₹${invoiceData.totals.CGSTAmount.toFixed(2)}`, 400, totalsY + 15, { width: 100, align: 'right' });

        doc.text(`SGST (${invoiceData.totals.SGSTPercent}%):`, 350, totalsY + 30);
        doc.text(`₹${invoiceData.totals.SGSTAmount.toFixed(2)}`, 400, totalsY + 30, { width: 100, align: 'right' });

        doc.text('Grand Total:', 350, totalsY + 45);
        doc.text(`₹${invoiceData.totals.grandTotal.toFixed(2)}`, 400, totalsY + 45, { width: 100, align: 'right' });

        doc.text('Amount Paid:', 350, totalsY + 60);
        doc.text(`₹${invoiceData.paymentDetails.amountPaid.toFixed(2)}`, 400, totalsY + 60, { width: 100, align: 'right' });

        doc.text('Balance Due:', 350, totalsY + 75);
        doc.text(`₹${invoiceData.paymentDetails.balanceDue.toFixed(2)}`, 400, totalsY + 75, { width: 100, align: 'right' });

        // Payment Mode
        doc.text(`Payment Mode: ${invoiceData.paymentDetails.paymentMode}`, 50, totalsY + 95);

        // Footer
        doc.fontSize(8).font('Helvetica')
            .text('Thank you for your business!', 50, 750, { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
}