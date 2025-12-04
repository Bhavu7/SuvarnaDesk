import { Schema, model, Document, Model } from "mongoose";

export interface IProduct extends Document {
    productNo: string;
    name: string;
    quantity: number;
    hsnCode: string;
    weight: number;
    weightUnit: "g" | "mg" | "kg" | "tola";
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
        weightUnit: {
            type: String,
            enum: ["g", "mg", "kg", "tola"],
            default: "g",
            required: true,
        },
    },
    { timestamps: true }
);

// Create and export the model
const Product: Model<IProduct> = model<IProduct>("Product", ProductSchema);

export default Product;