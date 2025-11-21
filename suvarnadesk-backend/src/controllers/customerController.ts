import Customer from '../models/Customer';

export const createCustomer = async (req, res) => {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
};

export const getCustomers = async (req, res) => {
    const customers = await Customer.find({});
    res.json(customers);
};
