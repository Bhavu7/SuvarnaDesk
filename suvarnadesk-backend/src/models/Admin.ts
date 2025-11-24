import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {
    name?: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
}

const adminSchema = new Schema<IAdmin>({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: "admin" }
});

export default model<IAdmin>("Admin", adminSchema);
