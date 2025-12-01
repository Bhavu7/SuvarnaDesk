// models/Customer.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    email?: string;
    phone: string;
    address?: string;
    huid?: string; // Hallmark Unique ID
    gstNumber?: string;
    totalPurchases: number;
    totalAmountSpent: number;
    lastPurchaseDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            unique: true,
        },
        address: {
            type: String,
            trim: true,
        },
        huid: {
            type: String,
            trim: true,
            sparse: true,
        },
        gstNumber: {
            type: String,
            trim: true,
        },
        totalPurchases: {
            type: Number,
            default: 0,
        },
        totalAmountSpent: {
            type: Number,
            default: 0,
        },
        lastPurchaseDate: {
            type: Date,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
CustomerSchema.index({ phone: 1 }, { unique: true });
CustomerSchema.index({ email: 1 }, { sparse: true });
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ createdAt: -1 });
CustomerSchema.index({ totalAmountSpent: -1 });

const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
export default Customer;