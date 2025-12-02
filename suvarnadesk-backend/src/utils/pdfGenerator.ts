// src/utils/pdfGenerator.ts
import PDFDocument from 'pdfkit';
import { Response } from 'express';

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
        // Get user agent from request
        const userAgent = (res as any).req?.headers['user-agent'] || '';
        const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());

        // Create PDF document with optimized settings
        const doc = new PDFDocument({
            margin: 30,
            size: 'A4',
            info: {
                Title: `Invoice ${invoiceData.invoiceNumber}`,
                Author: invoiceData.shopSettings?.shopName || 'Jewelry Shop',
                Subject: 'Invoice',
                Keywords: 'invoice,billing,jewelry',
                Creator: 'SuvarnaDesk',
                CreationDate: new Date()
            },
            pdfVersion: '1.5',
            lang: 'en'
        });

        // Generate filename
        const filename = `Invoice_${invoiceData.invoiceNumber}_${invoiceData.customerSnapshot.name.replace(/\s+/g, '_')
            }.pdf`;

        // Set response headers for auto-download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Transfer-Encoding', 'binary');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');

        // For iOS/mobile optimization
        if (isMobile) {
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        }

        doc.pipe(res);

        // Optimize for mobile readability
        const baseFontSize = isMobile ? 9 : 10;
        const titleFontSize = isMobile ? 16 : 20;
        const headerFontSize = isMobile ? 12 : 14;
        const tableFontSize = isMobile ? 8 : 9;

        // Header Section
        const logoWidth = 60;
        const logoHeight = 60;

        // Add logo if available (optional)
        try {
            // You can add a logo here if you have one
            // doc.image('path/to/logo.png', 50, 45, { width: logoWidth, height: logoHeight });
        } catch (e) {
            // No logo, continue without
        }

        // Shop Name
        doc.fontSize(titleFontSize).font('Helvetica-Bold')
            .text(invoiceData.shopSettings?.shopName || 'JEWELRY SHOP', {
                align: 'center',
                underline: false
            })
            .moveDown(0.5);

        // Shop Details
        doc.fontSize(baseFontSize).font('Helvetica')
            .text(invoiceData.shopSettings?.address || '', { align: 'center' })
            .text(`Phone: ${invoiceData.shopSettings?.phone || ''}`, { align: 'center' });

        if (invoiceData.shopSettings?.gstNumber) {
            doc.text(`GST: ${invoiceData.shopSettings.gstNumber}`, { align: 'center' });
        }

        doc.moveDown();

        // Invoice Title
        doc.fontSize(headerFontSize).font('Helvetica-Bold')
            .text('TAX INVOICE', { align: 'center' })
            .moveDown();

        // Invoice Details Section
        const invoiceDate = typeof invoiceData.date === 'string'
            ? new Date(invoiceData.date)
            : invoiceData.date;

        // Create a table for invoice details
        const detailStartY = doc.y;

        // Left column - Invoice details
        doc.fontSize(baseFontSize).font('Helvetica')
            .text('Invoice Number:', 50, detailStartY)
            .font('Helvetica-Bold')
            .text(invoiceData.invoiceNumber, 150, detailStartY)

            .moveDown(1.5)
            .font('Helvetica')
            .text('Invoice Date:', 50, doc.y)
            .text(invoiceDate.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }), 150, doc.y);

        // Right column - Customer details
        doc.font('Helvetica-Bold')
            .text('Customer Details:', 300, detailStartY)
            .font('Helvetica')
            .text(`Name: ${invoiceData.customerSnapshot.name}`, 300, detailStartY + 15)
            .text(`Phone: ${invoiceData.customerSnapshot.phone}`, 300, detailStartY + 30);

        if (invoiceData.customerSnapshot.email) {
            doc.text(`Email: ${invoiceData.customerSnapshot.email}`, 300, detailStartY + 45);
        }

        if (invoiceData.customerSnapshot.huid) {
            doc.text(`HUID: ${invoiceData.customerSnapshot.huid}`, 300, detailStartY + 60);
        }

        doc.moveDown(4);

        // Line Items Table
        const tableTop = doc.y + 10;

        // Table Header
        doc.rect(50, tableTop, 500, 20).fill('#1f9e4d');

        doc.fillColor('white').fontSize(tableFontSize).font('Helvetica-Bold');
        doc.text('Description', 55, tableTop + 5, { width: 200 });
        doc.text('Weight', 260, tableTop + 5, { width: 60, align: 'center' });
        doc.text('Rate/Gram', 330, tableTop + 5, { width: 70, align: 'right' });
        doc.text('Amount', 410, tableTop + 5, { width: 80, align: 'right' });

        // Table Rows
        let yPosition = tableTop + 25;
        doc.fillColor('black').font('Helvetica');

        invoiceData.lineItems.forEach((item, index) => {
            // Check if we need a new page
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;

                // Redraw header on new page
                doc.rect(50, yPosition - 25, 500, 20).fill('#1f9e4d');
                doc.fillColor('white').fontSize(tableFontSize).font('Helvetica-Bold');
                doc.text('Description', 55, yPosition - 20, { width: 200 });
                doc.text('Weight', 260, yPosition - 20, { width: 60, align: 'center' });
                doc.text('Rate/Gram', 330, yPosition - 20, { width: 70, align: 'right' });
                doc.text('Amount', 410, yPosition - 20, { width: 80, align: 'right' });
                doc.fillColor('black');
                yPosition += 5;
            }

            // Draw row background
            if (index % 2 === 0) {
                doc.rect(50, yPosition - 5, 500, 20).fill('#f8f9fa');
            }

            // Item description
            const description = `${item.itemType.toUpperCase()} ${item.purity} - ${item.description}`;
            doc.fillColor('black').fontSize(tableFontSize)
                .text(description, 55, yPosition, { width: 200 });

            // Weight
            doc.text(`${item.weight.value} ${item.weight.unit}`, 260, yPosition, {
                width: 60,
                align: 'center'
            });

            // Rate per gram
            doc.text(`₹${item.ratePerGram.toFixed(2)}`, 330, yPosition, {
                width: 70,
                align: 'right'
            });

            // Amount
            doc.text(`₹${item.itemTotal.toFixed(2)}`, 410, yPosition, {
                width: 80,
                align: 'right'
            });

            yPosition += 25;
        });

        // Draw table bottom border
        doc.rect(50, yPosition - 5, 500, 2).fill('#1f9e4d');

        // Totals Section
        const totalsY = Math.max(yPosition + 20, 650);

        // Background for totals
        doc.rect(300, totalsY - 10, 250, 120).fill('#f8f9fa').stroke('#1f9e4d');

        doc.fillColor('black').fontSize(baseFontSize).font('Helvetica');

        // Subtotal
        doc.text('Subtotal:', 310, totalsY);
        doc.font('Helvetica-Bold')
            .text(`₹${invoiceData.totals.subtotal.toFixed(2)}`, 430, totalsY, {
                width: 100,
                align: 'right'
            });

        // CGST
        doc.font('Helvetica')
            .text(`CGST (${invoiceData.totals.CGSTPercent}%):`, 310, totalsY + 20);
        doc.font('Helvetica-Bold')
            .text(`₹${invoiceData.totals.CGSTAmount.toFixed(2)}`, 430, totalsY + 20, {
                width: 100,
                align: 'right'
            });

        // SGST
        doc.font('Helvetica')
            .text(`SGST (${invoiceData.totals.SGSTPercent}%):`, 310, totalsY + 40);
        doc.font('Helvetica-Bold')
            .text(`₹${invoiceData.totals.SGSTAmount.toFixed(2)}`, 430, totalsY + 40, {
                width: 100,
                align: 'right'
            });

        // Grand Total
        doc.rect(300, totalsY + 65, 250, 2).fill('#1f9e4d');
        doc.fontSize(baseFontSize + 2).font('Helvetica-Bold').fillColor('#1f9e4d')
            .text('Grand Total:', 310, totalsY + 75);
        doc.text(`₹${invoiceData.totals.grandTotal.toFixed(2)}`, 430, totalsY + 75, {
            width: 100,
            align: 'right'
        });

        // Payment Details
        doc.fillColor('black').fontSize(baseFontSize).font('Helvetica')
            .text('Payment Details:', 50, totalsY + 110)
            .moveDown(0.5)
            .text(`Mode: ${invoiceData.paymentDetails.paymentMode.toUpperCase()}`, 50, doc.y)
            .text(`Amount Paid: ₹${invoiceData.paymentDetails.amountPaid.toFixed(2)}`, 50, doc.y + 15)
            .text(`Balance Due: ₹${invoiceData.paymentDetails.balanceDue.toFixed(2)}`, 50, doc.y + 30);

        // Footer with QR code instructions
        const footerY = 750;
        doc.fontSize(8).font('Helvetica').fillColor('#666')
            .text('Scan QR code for digital copy', 50, footerY, { align: 'center' })
            .moveDown(0.5)
            .text('Thank you for your business!', 50, doc.y, { align: 'center' });

        // Add page number if multiple pages
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor('#999')
                .text(`Page ${i + 1} of ${pages.count}`, 500, 780, { align: 'right' });
        }

        doc.end();

    } catch (error) {
        console.error('PDF generation error:', error);

        // Send a proper error response
        res.status(500).json({
            error: 'Failed to generate PDF',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}