import mongoose, { Schema, Document } from 'mongoose';

const LineItemSchema = new Schema({
    itemType: { type: String, enum: ["gold", "silver", "other"], required: true },
    description: { type: String, required: true },
    purity: { type: String, required: true },
    weight: {
        value: { type: Number, required: true },
        unit: { type: String, required: true }
    },
    ratePerGram: { type: Number, required: true },
    labourChargeReferenceId: { type: Schema.Types.ObjectId, ref: 'LabourCharge' },
    labourChargeType: { type: String, enum: ["perGram", "fixedPerItem", null] },
    labourChargeAmount: { type: Number },
    makingChargesTotal: { type: Number },
    itemTotal: { type: Number, required: true }
});

export interface IInvoice extends Document {
    invoiceNumber: string;
    date: Date;
    customerId: mongoose.Types.ObjectId;
    customerSnapshot: object;
    lineItems: object[];
    totals: object;
    paymentDetails: object;
    QRCodeData: string;
    createdBy: mongoose.Types.ObjectId;
    updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerSnapshot: { type: Object, required: true },
    lineItems: [LineItemSchema],
    totals: {
        subtotal: { type: Number },
        GSTPercent: { type: Number },
        GSTAmount: { type: Number },
        grandTotal: { type: Number }
    },
    paymentDetails: {
        paymentMode: { type: String },
        amountPaid: { type: Number },
        balanceDue: { type: Number },
        notes: { type: String }
    },
    QRCodeData: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    updatedAt: { type: Date, default: Date.now }
});
export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
