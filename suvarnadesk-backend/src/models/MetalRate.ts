// models/MetalRate.ts
import { Schema, model, Document } from "mongoose";

export interface IMetalRate extends Document {
    metalType: "gold" | "silver";
    purity: string;
    ratePerGram: number;
    effectiveFrom: Date;
    source: "manual" | "api" | "live";
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const metalRateSchema = new Schema<IMetalRate>({
    metalType: { type: String, enum: ["gold", "silver"], required: true },
    purity: { type: String, required: true },
    ratePerGram: { type: Number, required: true },
    effectiveFrom: { type: Date, required: true },
    source: {
        type: String,
        enum: ["manual", "api", "live"],
        default: "manual",
        required: true
    },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Index for active rates
metalRateSchema.index({ metalType: 1, purity: 1, isActive: 1 }, {
    unique: true,
    partialFilterExpression: { isActive: true }
});

export default model<IMetalRate>("MetalRate", metalRateSchema);