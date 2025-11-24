import { Schema, model, Document } from "mongoose";

export interface ICustomer extends Document {
    name: string;
    email: string;
    phone: string;
    address?: string;
}

const customerSchema = new Schema<ICustomer>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String }
});

export default model<ICustomer>("Customer", customerSchema);
