import PDFDocument from 'pdfkit';
import { Response } from 'express';

// More flexible interface that matches Mongoose structure
export interface InvoicePDFData {
    invoiceNumber: string;
    date: string | Date;
    customerSnapshot: {
        name: string;
        email: string;
        phone: string;
        address?: string;
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
        labourChargeType?: string;
        labourChargeAmount?: number;
        labourChargeReferenceId?: any;
    }>;
    totals: {
        subtotal: number;
        GSTPercent: number;
        GSTAmount: number;
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
        logoUrl?: string;
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

        if (invoiceData.customerSnapshot.address) {
            doc.text(`Address: ${invoiceData.customerSnapshot.address}`);
        }

        doc.moveDown();

        // Line Items Table Header
        const tableTop = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Description', 50, tableTop);
        doc.text('Purity', 200, tableTop);
        doc.text('Weight', 250, tableTop);
        doc.text('Rate/Gram', 300, tableTop);
        doc.text('Amount', 370, tableTop, { width: 100, align: 'right' });

        // Line Items
        let yPosition = tableTop + 20;
        doc.fontSize(9).font('Helvetica');

        invoiceData.lineItems.forEach((item, index) => {
            if (yPosition > 700) { // Add new page if needed
                doc.addPage();
                yPosition = 50;
            }

            doc.text(item.description, 50, yPosition, { width: 140 });
            doc.text(item.purity, 200, yPosition);
            doc.text(`${item.weight.value} ${item.weight.unit}`, 250, yPosition);
            doc.text(`₹${item.ratePerGram}`, 300, yPosition);
            doc.text(`₹${item.itemTotal.toFixed(2)}`, 370, yPosition, { width: 100, align: 'right' });

            yPosition += 20;
        });

        // Totals Section
        const totalsY = Math.max(yPosition + 20, 650);
        doc.fontSize(10).font('Helvetica-Bold');

        doc.text('Subtotal:', 300, totalsY);
        doc.text(`₹${invoiceData.totals.subtotal.toFixed(2)}`, 370, totalsY, { width: 100, align: 'right' });

        doc.text(`GST (${invoiceData.totals.GSTPercent}%):`, 300, totalsY + 15);
        doc.text(`₹${invoiceData.totals.GSTAmount.toFixed(2)}`, 370, totalsY + 15, { width: 100, align: 'right' });

        doc.text('Grand Total:', 300, totalsY + 30);
        doc.text(`₹${invoiceData.totals.grandTotal.toFixed(2)}`, 370, totalsY + 30, { width: 100, align: 'right' });

        doc.text('Amount Paid:', 300, totalsY + 45);
        doc.text(`₹${invoiceData.paymentDetails.amountPaid.toFixed(2)}`, 370, totalsY + 45, { width: 100, align: 'right' });

        doc.text('Balance Due:', 300, totalsY + 60);
        doc.text(`₹${invoiceData.paymentDetails.balanceDue.toFixed(2)}`, 370, totalsY + 60, { width: 100, align: 'right' });

        // Payment Mode
        doc.text(`Payment Mode: ${invoiceData.paymentDetails.paymentMode}`, 50, totalsY + 80);

        // Footer
        doc.fontSize(8).font('Helvetica')
            .text('Thank you for your business!', 50, 750, { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
}