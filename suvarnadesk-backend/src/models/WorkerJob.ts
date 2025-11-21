import mongoose, { Schema, Document } from 'mongoose';
export interface IWorkerJob extends Document {
    jobNumber: string;
    customerId?: mongoose.Types.ObjectId;
    customerName?: string;
    customerPhone?: string;
    jobType: "repair" | "modification" | "custom";
    description: string;
    metalType: string;
    purity?: string;
    estimatedWeightBefore: object;
    estimatedWeightAfter: object;
    receivedDate: Date;
    promisedDeliveryDate: Date;
    actualDeliveryDate?: Date;
    status: string;
    estimatedCharges: number;
    finalCharges?: number;
    labourChargesDetail: object;
    paymentStatus: "unpaid" | "partial" | "paid";
    takenReceiptNumber: string;
    givenReceiptNumber: string;
    notes?: string;
    attachments?: string[];
}
const WorkerJobSchema: Schema = new Schema({
    jobNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    customerPhone: { type: String },
    jobType: { type: String, enum: ["repair", "modification", "custom"], required: true },
    description: { type: String, required: true },
    metalType: { type: String, required: true },
    purity: { type: String },
    estimatedWeightBefore: { type: Object },
    estimatedWeightAfter: { type: Object },
    receivedDate: { type: Date, required: true },
    promisedDeliveryDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date },
    status: { type: String, enum: ["received", "inProgress", "ready", "delivered", "cancelled"], required: true },
    estimatedCharges: { type: Number, required: true },
    finalCharges: { type: Number },
    labourChargesDetail: { type: Object },
    paymentStatus: { type: String, enum: ["unpaid", "partial", "paid"], required: true },
    takenReceiptNumber: { type: String },
    givenReceiptNumber: { type: String },
    notes: { type: String },
    attachments: [{ type: String }]
});
export default mongoose.model<IWorkerJob>('WorkerJob', WorkerJobSchema);
