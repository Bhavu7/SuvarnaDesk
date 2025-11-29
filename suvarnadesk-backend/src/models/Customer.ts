// In models/Customer.ts (if you have one)
import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
    name: string;
    email?: string;
    phone: string;
    address?: string;
    huid?: string; // Add this
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        address: { type: String },
        huid: { type: String }, // Add this
    },
    { timestamps: true }
);

export default mongoose.model<ICustomer>("Customer", CustomerSchema);