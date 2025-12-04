import { Request, Response } from "express";
import Product from "../models/Product";

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.create(req.body);
        return res.status(201).json(product);
    } catch (err: any) {
        return res
            .status(400)
            .json({ error: err.message || "Failed to create product" });
    }
};

export const getProducts = async (_req: Request, res: Response) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json(products);
    } catch (err: any) {
        return res
            .status(500)
            .json({ error: err.message || "Failed to fetch products" });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        return res.json(product);
    } catch (err: any) {
        return res
            .status(500)
            .json({ error: err.message || "Failed to fetch product" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!product) return res.status(404).json({ error: "Product not found" });
        return res.json(product);
    } catch (err: any) {
        return res
            .status(400)
            .json({ error: err.message || "Failed to update product" });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        return res.json({ message: "Product deleted successfully" });
    } catch (err: any) {
        return res
            .status(500)
            .json({ error: err.message || "Failed to delete product" });
    }
};
