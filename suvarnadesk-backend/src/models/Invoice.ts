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
    };
    lineItems: ILineItem[];
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
    QRCodeData?: string;
    createdAt: Date;
    updatedAt: Date;
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
            email: { type: String },
            phone: { type: String, required: true },
            address: { type: String },
            huid: { type: String },
        },
        lineItems: { type: [LineItemSchema], required: true },
        totals: {
            subtotal: { type: Number, required: true },
            CGSTPercent: { type: Number, required: true },
            CGSTAmount: { type: Number, required: true },
            SGSTPercent: { type: Number, required: true },
            SGSTAmount: { type: Number, required: true },
            grandTotal: { type: Number, required: true },
        },
        paymentDetails: {
            paymentMode: { type: String, required: true },
            amountPaid: { type: Number, required: true },
            balanceDue: { type: Number, required: true },
        },
        QRCodeData: { type: String },
    },
    { timestamps: true }
);

// Export the model
const Invoice = mongoose.model<IInvoice>("Invoice", InvoiceSchema);
export default Invoice;