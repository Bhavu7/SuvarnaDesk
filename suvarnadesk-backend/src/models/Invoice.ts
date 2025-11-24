import { Schema, model, Document, Types } from "mongoose";

const LineItemSchema = new Schema({
    itemType: { type: String, enum: ["gold", "silver", "other"], required: true },
    description: { type: String, required: true },
    purity: { type: String, required: true },
    weight: {
        value: { type: Number, required: true },
        unit: { type: String, required: true }
    },
    ratePerGram: { type: Number, required: true },
    labourChargeReferenceId: { type: Types.ObjectId, ref: "LabourCharge" },
    labourChargeType: { type: String, enum: ["perGram", "fixedPerItem", null] },
    labourChargeAmount: { type: Number },
    makingChargesTotal: { type: Number },
    itemTotal: { type: Number, required: true }
});

export interface IInvoice extends Document {
    invoiceNumber: string;
    date: Date;
    customerId: Types.ObjectId;
    customerSnapshot: any;
    lineItems: typeof LineItemSchema[];
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
    createdBy?: Types.ObjectId;
}

const invoiceSchema = new Schema<IInvoice>({
    invoiceNumber: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    customerSnapshot: { type: Schema.Types.Mixed, required: true },
    lineItems: [LineItemSchema],
    totals: { type: Schema.Types.Mixed, required: true },
    paymentDetails: { type: Schema.Types.Mixed, required: true },
    QRCodeData: { type: String },
    createdBy: { type: Types.ObjectId, ref: "Admin" }
}, { timestamps: true });

export default model<IInvoice>("Invoice", invoiceSchema);
