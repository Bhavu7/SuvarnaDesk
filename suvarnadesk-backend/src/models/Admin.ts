import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
    name: string;
    email: string;
    phone?: string;
    role: string;
    password: string;
    memberSince: Date;
    lastLogin: Date;
}

const AdminSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { type: String, default: "admin" },
    password: { type: String, required: true },
    memberSince: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
});

const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
