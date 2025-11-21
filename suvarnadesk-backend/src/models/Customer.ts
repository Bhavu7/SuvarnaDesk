import mongoose, { Schema, Document } from 'mongoose';
export interface ICustomer extends Document {
    name: string;
    phone: string;
    address: string;
    shopName?: string;
    GSTNumber?: string;
    notes?: string;
}
const CustomerSchema: Schema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    shopName: { type: String },
    GSTNumber: { type: String },
    notes: { type: String }
});
export default mongoose.model<ICustomer>('Customer', CustomerSchema);
