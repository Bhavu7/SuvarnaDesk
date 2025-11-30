import mongoose, { Schema, Document } from "mongoose";
import { hashPassword, comparePassword } from "../utils/hashPassword";

export interface IAdmin extends Document {
    name: string;
    email: string;
    phone?: string;
    role: string;
    password: string;
    memberSince: Date;
    lastLogin: Date;

    // Settings fields
    shopName?: string;
    address?: string;
    gstNumber?: string;
    logoUrl?: string;
    ownerName?: string;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { type: String, default: "admin" },
    password: { type: String, required: true },
    memberSince: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },

    // Settings fields
    shopName: { type: String },
    address: { type: String },
    gstNumber: { type: String },
    logoUrl: { type: String },
    ownerName: { type: String },
});

// Hash password before saving
AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        // Explicitly type this.password as string
        const password = this.password as string;
        this.password = await hashPassword(password);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Compare password method - Fixed TypeScript error
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        // Explicitly type this.password as string
        const hashedPassword = this.password as string;
        return await comparePassword(candidatePassword, hashedPassword);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;