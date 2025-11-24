import { Schema, model, Document } from "mongoose";

export interface ILabourCharge extends Document {
    name: string;
    chargeType: "perGram" | "fixedPerItem";
    amount: number;
    isActive: boolean;
}

const labourChargeSchema = new Schema<ILabourCharge>({
    name: { type: String, required: true },
    chargeType: { type: String, enum: ["perGram", "fixedPerItem"], required: true },
    amount: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
});

export default model<ILabourCharge>("LabourCharge", labourChargeSchema);
