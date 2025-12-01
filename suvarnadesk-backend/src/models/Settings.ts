// src/models/Settings.ts
import { Schema, model, Document } from "mongoose";

export interface IShopSettings extends Document {
    shopName: string;
    ownerName: string;
    address: string;
    phone: string;
    goldGstNumber?: string;
    silverGstNumber?: string;
    logoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const settingsSchema = new Schema<IShopSettings>({
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    goldGstNumber: { type: String },
    silverGstNumber: { type: String },
    logoUrl: { type: String }
}, {
    timestamps: true
});

export default model<IShopSettings>("Settings", settingsSchema);