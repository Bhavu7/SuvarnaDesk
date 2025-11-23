import { Schema, model, Document } from "mongoose";

export interface IMetalRate extends Document {
    metalType: "gold" | "silver";
    purity: string;
    ratePerGram: number;
    effectiveFrom: Date;
    source: string;
    isActive: boolean;
}

const metalRateSchema = new Schema<IMetalRate>({
    metalType: { type: String, enum: ["gold", "silver"], required: true },
    purity: { type: String, required: true },
    ratePerGram: { type: Number, required: true },
    effectiveFrom: { type: Date, required: true },
    source: { type: String, required: true },
    isActive: { type: Boolean, default: true }
});

export default model<IMetalRate>("MetalRate", metalRateSchema);
