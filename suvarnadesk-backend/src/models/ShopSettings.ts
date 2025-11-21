import mongoose, { Schema, Document } from 'mongoose';
export interface IShopSettings extends Document {
    shopName: string;
    ownerName: string;
    GSTNumber: string;
    address: string;
    contactNumber: string;
    logoUrl?: string;
    defaultCurrency: string;
}
const ShopSettingsSchema: Schema = new Schema({
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    GSTNumber: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    logoUrl: { type: String },
    defaultCurrency: { type: String, default: 'INR' }
});
export default mongoose.model<IShopSettings>('ShopSettings', ShopSettingsSchema);
