import { Schema, model, Document, Types } from "mongoose";

export interface IWorkerJob extends Document {
    description: string;
    jobType: string;
    status: string;
    estimatedCharges: number;
    paymentStatus: string;
    metalType: string;
    estimatedWeightBefore?: { value: number; unit: string };
    estimatedWeightAfter?: { value: number; unit: string };
    receivedDate: Date;
    promisedDeliveryDate: Date;
    createdBy?: Types.ObjectId;
}

const workerJobSchema = new Schema<IWorkerJob>({
    description: { type: String, required: true },
    jobType: { type: String, required: true },
    status: { type: String, required: true },
    estimatedCharges: { type: Number, default: 0 },
    paymentStatus: { type: String, required: true },
    metalType: { type: String, required: true },
    estimatedWeightBefore: {
        value: { type: Number },
        unit: { type: String }
    },
    estimatedWeightAfter: {
        value: { type: Number },
        unit: { type: String }
    },
    receivedDate: { type: Date },
    promisedDeliveryDate: { type: Date },
    createdBy: { type: Types.ObjectId, ref: "Admin" }
}, { timestamps: true });

export default model<IWorkerJob>("WorkerJob", workerJobSchema);
