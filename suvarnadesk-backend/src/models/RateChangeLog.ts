import { Schema, model, Document, Types } from "mongoose";

export interface IRateChangeLog extends Document {
    metalType: "gold" | "silver";
    oldRate: number;
    newRate: number;
    changedAt: Date;
    changedBy: Types.ObjectId;
}

const rateChangeLogSchema = new Schema<IRateChangeLog>({
    metalType: { type: String, enum: ["gold", "silver"], required: true },
    oldRate: { type: Number, required: true },
    newRate: { type: Number, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Types.ObjectId, ref: "Admin" }
});

export default model<IRateChangeLog>("RateChangeLog", rateChangeLogSchema);
