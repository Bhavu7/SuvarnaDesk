import { Schema, model, Document } from "mongoose";

export interface IShopSettings extends Document {
    shopName: string;
    ownerName: string;
    goldOwnerName: string;     // Added: Gold specific owner name
    silverOwnerName: string;   // Added: Silver specific owner name
    address: string;
    phone: string;
    goldGstNumber?: string;
    silverGstNumber?: string;
    goldPanNumber?: string;
    silverPanNumber?: string;
    logoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const settingsSchema = new Schema<IShopSettings>({
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    goldOwnerName: { type: String, default: "Jay Krushna Haribhai Soni" },     // Added with default
    silverOwnerName: { type: String, default: "M/s Yogeshkumar and Brothers" }, // Added with default
    address: { type: String, required: true },
    phone: { type: String, required: true },
    goldGstNumber: { type: String },
    silverGstNumber: { type: String },
    goldPanNumber: { type: String },
    silverPanNumber: { type: String },
    logoUrl: { type: String }
}, {
    timestamps: true
});

export default model<IShopSettings>("Settings", settingsSchema);