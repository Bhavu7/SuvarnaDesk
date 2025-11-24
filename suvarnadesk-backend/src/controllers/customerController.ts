import Customer from "../models/Customer";
import { Request, Response } from "express";

// POST /api/customers
export const createCustomer = async (req: Request, res: Response) => {
    const { name, email, phone } = req.body;
    const exists = await Customer.findOne({ email });
    if (exists) return res.status(400).json({ error: "Customer already exists" });

    const customer = new Customer({ name, email, phone });
    await customer.save();
    res.status(201).json(customer);
};

// GET /api/customers
export const getCustomers = async (req: Request, res: Response) => {
    const customers = await Customer.find();
    res.json(customers);
};

// PUT /api/customers/:id
export const updateCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const customer = await Customer.findByIdAndUpdate(
        id,
        { name, email, phone },
        { new: true }
    );
    res.json(customer);
};

// DELETE /api/customers/:id
export const deleteCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;
    await Customer.findByIdAndDelete(id);
    res.json({ message: "Customer deleted" });
};
