import { Schema, model, Document, Types } from "mongoose";

export interface IWorkerJob extends Document {
    title: string;
    description?: string;
    assignedTo: Types.ObjectId;
    assignedBy: Types.ObjectId;
    status: "pending" | "in-progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high";
    dueDate?: Date;
    completedAt?: Date;
}

const workerJobSchema = new Schema<IWorkerJob>({
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    status: {
        type: String,
        enum: ["pending", "in-progress", "completed", "cancelled"],
        default: "pending"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    dueDate: { type: Date },
    completedAt: { type: Date }
}, { timestamps: true });

export default model<IWorkerJob>("WorkerJob", workerJobSchema);