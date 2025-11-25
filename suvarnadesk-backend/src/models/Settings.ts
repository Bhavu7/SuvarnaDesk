import { Schema, model, Document } from "mongoose";

export interface IShopSettings extends Document {
    shopName: string;
    ownerName: string;
    address: string;
    phone: string;
    gstNumber?: string;
    logoUrl?: string;
}

const shopSettingsSchema = new Schema<IShopSettings>({
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    gstNumber: { type: String },
    logoUrl: { type: String }
});

export default model<IShopSettings>("ShopSettings", shopSettingsSchema);
