import mongoose, { Schema, Document } from 'mongoose';
export interface ILabourCharge extends Document {
    name: string;
    chargeType: "perGram" | "fixedPerItem";
    amount: number;
    description?: string;
    isActive: boolean;
}
const LabourChargeSchema: Schema = new Schema({
    name: { type: String, required: true },
    chargeType: { type: String, enum: ["perGram", "fixedPerItem"], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true }
});
export default mongoose.model<ILabourCharge>('LabourCharge', LabourChargeSchema);
