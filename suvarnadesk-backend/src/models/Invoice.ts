// src/models/Invoice.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILineItem {
    itemType: "gold" | "silver" | "other";
    purity: string;
    description: string;
    weight: {
        value: number;
        unit: string;
    };
    ratePerGram: number;
    labourChargeReferenceId?: string;
    labourChargeType?: "perGram" | "fixed" | null;
    labourChargeAmount: number;
    makingChargesTotal: number;
    otherCharges: number;
    itemTotal: number;
}

export interface IInvoice extends Document {
    invoiceNumber: string;
    date: string;
    customerId: string;
    customerSnapshot: {
        name: string;
        email?: string;
        phone: string;
        address?: string;
        huid?: string;
        hsnCode?: string;
        gstin?: string;
        state?: string;
    };
    lineItems: ILineItem[];
    totals: {
        subtotal: number;
        CGSTPercent: number;
        CGSTAmount: number;
        SGSTPercent: number;
        SGSTAmount: number;
        totalGST: number;
        grandTotal: number;
    };
    paymentDetails: {
        paymentMode: string;
        amountPaid: number;
        balanceDue: number;
    };
    QRCodeData?: string;
    pdfData?: any[];
    ratesSource?: "live" | "manual";
    gstInfo?: any;
    downloadUrl?: string;
    createdAt: Date;
    updatedAt: Date;

    // Methods
    getDownloadUrl(): string;

    // Virtuals
    qrCodeUrl: string;
}

const LineItemSchema = new Schema<ILineItem>(
    {
        itemType: { type: String, required: true },
        purity: { type: String, required: true },
        description: { type: String, default: "" },
        weight: {
            value: { type: Number, required: true },
            unit: { type: String, required: true },
        },
        ratePerGram: { type: Number, required: true },
        labourChargeReferenceId: { type: String },
        labourChargeType: { type: String },
        labourChargeAmount: { type: Number, required: true },
        makingChargesTotal: { type: Number, required: true },
        otherCharges: { type: Number, default: 0 },
        itemTotal: { type: Number, required: true },
    },
    { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
    {
        invoiceNumber: { type: String, unique: true, required: true },
        date: { type: String, required: true },
        customerId: { type: String, required: true },
        customerSnapshot: {
            name: { type: String, required: true },
            email: { type: String, default: "" },
            phone: { type: String, required: true },
            address: { type: String, default: "" },
            huid: { type: String, default: "" },
            hsnCode: { type: String, default: "" },
            gstin: { type: String, default: "" },
            state: { type: String, default: "Gujarat" },
        },
        lineItems: { type: [LineItemSchema], required: true },
        totals: {
            subtotal: { type: Number, required: true, min: 0 },
            CGSTPercent: { type: Number, required: true, min: 0, max: 100 },
            CGSTAmount: { type: Number, required: true, min: 0 },
            SGSTPercent: { type: Number, required: true, min: 0, max: 100 },
            SGSTAmount: { type: Number, required: true, min: 0 },
            totalGST: { type: Number, required: true, min: 0 },
            grandTotal: { type: Number, required: true, min: 0 },
        },
        paymentDetails: {
            paymentMode: { type: String, required: true },
            amountPaid: { type: Number, required: true, min: 0 },
            balanceDue: { type: Number, required: true, min: 0 },
        },
        QRCodeData: { type: String, default: "" },
        pdfData: { type: Schema.Types.Mixed, default: [] },
        ratesSource: {
            type: String,
            enum: ['live', 'manual'],
            default: 'manual'
        },
        gstInfo: { type: Schema.Types.Mixed, default: {} },
        downloadUrl: { type: String, default: "" },
    },
    { timestamps: true }
);

// Method: Get download URL
InvoiceSchema.methods.getDownloadUrl = function (): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/api/invoices/download/${this.invoiceNumber}?auto=1`;
};

// Virtual: QR code URL
InvoiceSchema.virtual('qrCodeUrl').get(function (this: IInvoice) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/api/invoices/download/${this.invoiceNumber}?auto=1`;
});

// Ensure virtuals are included in JSON output
InvoiceSchema.set('toJSON', { virtuals: true });
InvoiceSchema.set('toObject', { virtuals: true });

// Export the model
const Invoice = mongoose.model<IInvoice>("Invoice", InvoiceSchema);
export default Invoice;