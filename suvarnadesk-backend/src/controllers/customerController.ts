import Customer from '../models/Customer';
import { Request, Response } from 'express';

export const createCustomer = async (req: Request, res: Response) => {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
};

export const getCustomers = async (req: Request, res: Response) => {
    const customers = await Customer.find({});
    res.json(customers);
};
