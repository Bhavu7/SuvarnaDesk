import mongoose, { Schema, Document } from 'mongoose';
export interface IMetalRate extends Document {
    metalType: "gold" | "silver";
    purity: string;
    ratePerGram: number;
    effectiveFrom: Date;
    source: "manual" | "api";
    isActive: boolean;
}
const MetalRateSchema: Schema = new Schema({
    metalType: { type: String, enum: ["gold", "silver"], required: true },
    purity: { type: String, required: true },
    ratePerGram: { type: Number, required: true },
    effectiveFrom: { type: Date, required: true },
    source: { type: String, enum: ["manual", "api"], required: true },
    isActive: { type: Boolean, default: true }
});
export default mongoose.model<IMetalRate>('MetalRate', MetalRateSchema);
