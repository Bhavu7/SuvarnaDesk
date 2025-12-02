// models/Admin.ts - Update the existing model
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
    isActive: boolean;
    createdBy?: mongoose.Types.ObjectId;

    // Settings fields
    shopName?: string;
    address?: string;
    gstNumber?: string;
    logoUrl?: string;
    ownerName?: string;

    // Add these timestamps (automatically added by Mongoose)
    createdAt: Date;
    updatedAt: Date;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        default: "admin",
        enum: ["super_admin", "admin", "manager", "accountant"]
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    memberSince: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },

    // Settings fields
    shopName: { type: String },
    address: { type: String },
    gstNumber: { type: String },
    logoUrl: { type: String },
    ownerName: { type: String },
}, {
    timestamps: true
});

// Hash password before saving
AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const password = this.password as string;
        this.password = await hashPassword(password);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Compare password method
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        const hashedPassword = this.password as string;
        return await comparePassword(candidatePassword, hashedPassword);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

// Method to return admin without password
AdminSchema.methods.toJSON = function () {
    const admin = this.toObject();
    delete admin.password;
    return admin;
};

const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;