import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
    productNo: string;
    name: string;
    quantity: number;
    hsnCode: string;
    weight: number; // in grams or your chosen unit
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        productNo: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 0 },
        hsnCode: { type: String, required: true },
        weight: { type: Number, required: true },
    },
    { timestamps: true }
);

export default model<IProduct>("Product", ProductSchema);
