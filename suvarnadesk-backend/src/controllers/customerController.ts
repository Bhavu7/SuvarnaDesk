// controllers/customerController.ts
import { Request, Response } from 'express';
import Customer, { ICustomer } from '../models/Customer';

// Types
interface CustomerQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const getAllCustomers = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            page = '1',
            limit = '100',
            search = '',
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        // Build search query
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            }
            : {};

        // Execute query
        const customers = await Customer.find(searchQuery)
            .sort({ [sortBy.toString()]: sortOrder === 'desc' ? -1 : 1 })
            .limit(parseInt(limit.toString()))
            .skip((parseInt(page.toString()) - 1) * parseInt(limit.toString()))
            .select('-__v');

        // Return array directly for frontend compatibility
        res.json(customers);

    } catch (error: any) {
        console.error('Error fetching customers:', error);
        // Return empty array on error
        res.json([]);
    }
};

// Get single customer by ID
export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                error: 'Customer not found',
            });
        }

        res.json(customer);
    } catch (error: any) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            error: error.message,
        });
    }
};

// Create new customer
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const { name, phone, email, address, huid, gstNumber, notes } = req.body;

        // Validate required fields
        if (!name || !phone) {
            return res.status(400).json({
                error: 'Name and phone number are required',
            });
        }

        // Check if customer with same phone already exists
        const existingCustomer = await Customer.findOne({ phone });
        if (existingCustomer) {
            return res.status(400).json({
                error: 'Customer with this phone number already exists',
                data: existingCustomer,
            });
        }

        const customer = new Customer({
            name,
            phone,
            email,
            address,
            huid,
            gstNumber,
            notes,
            totalPurchases: 0,
            totalAmountSpent: 0,
        });

        await customer.save();

        res.status(201).json(customer);
    } catch (error: any) {
        console.error('Error creating customer:', error);
        res.status(500).json({
            error: error.message,
        });
    }
};


// Get customer by phone (useful for invoice creation)
export const getCustomerByPhone = async (req: Request, res: Response) => {
    try {
        const { phone } = req.params;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required',
            });
        }

        const customer = await Customer.findOne({ phone });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
        }

        res.json({
            success: true,
            data: customer,
        });
    } catch (error: any) {
        console.error('Error fetching customer by phone:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching customer',
            error: error.message,
        });
    }
};

// Create or update customer (upsert functionality)
export const createOrUpdateCustomer = async (req: Request, res: Response) => {
    try {
        const { name, phone, email, address, huid, gstNumber, notes } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone number are required',
            });
        }

        // Try to find existing customer by phone
        let customer = await Customer.findOne({ phone });

        if (customer) {
            // Update existing customer
            customer.name = name;
            customer.email = email || customer.email;
            customer.address = address || customer.address;
            customer.huid = huid || customer.huid;
            customer.gstNumber = gstNumber || customer.gstNumber;
            customer.notes = notes || customer.notes;
            customer.updatedAt = new Date();

            await customer.save();

            return res.json({
                success: true,
                message: 'Customer updated successfully',
                data: customer,
                isNew: false,
            });
        } else {
            // Create new customer
            const customerData: Partial<ICustomer> = {
                name,
                phone,
                email,
                address,
                huid,
                gstNumber,
                notes,
                totalPurchases: 0,
                totalAmountSpent: 0,
            };

            customer = new Customer(customerData);
            await customer.save();

            return res.status(201).json({
                success: true,
                message: 'Customer created successfully',
                data: customer,
                isNew: true,
            });
        }
    } catch (error: any) {
        console.error('Error creating/updating customer:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating/updating customer',
            error: error.message,
        });
    }
};

// Update customer purchase stats (call this when invoice is created)
export const updateCustomerPurchaseStats = async (
    customerId: string,
    purchaseAmount: number
) => {
    try {
        const customer = await Customer.findById(customerId);

        if (customer) {
            customer.totalPurchases += 1;
            customer.totalAmountSpent += purchaseAmount;
            customer.lastPurchaseDate = new Date();

            await customer.save();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating customer stats:', error);
        return false;
    }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates.totalPurchases;
        delete updates.totalAmountSpent;
        delete updates.lastPurchaseDate;
        delete updates.createdAt;

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
        }

        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: customer,
        });
    } catch (error: any) {
        console.error('Error updating customer:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating customer',
            error: error.message,
        });
    }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
        }

        res.json({
            success: true,
            message: 'Customer deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting customer:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting customer',
            error: error.message,
        });
    }
};

// Search customers (autocomplete)
export const searchCustomers = async (
    req: Request<{}, {}, {}, { query: string }>,
    res: Response
) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.json({
                success: true,
                data: [],
            });
        }

        const customers = await Customer.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
        })
            .limit(10)
            .select('name phone email address huid totalPurchases totalAmountSpent');

        res.json({
            success: true,
            data: customers,
        });
    } catch (error: any) {
        console.error('Error searching customers:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching customers',
            error: error.message,
        });
    }
};

// Get customer stats for dashboard
export const getCustomerStats = async (req: Request, res: Response) => {
    try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Get total customers
        const totalCustomers = await Customer.countDocuments();

        // Get new customers this month
        const newCustomersThisMonth = await Customer.countDocuments({
            createdAt: {
                $gte: new Date(currentYear, currentMonth, 1),
                $lt: new Date(currentYear, currentMonth + 1, 1),
            },
        });

        // Get customer growth trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyGrowth = await Customer.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmountSpent' },
                },
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1,
                },
            },
        ]);

        // Top customers by spending
        const topCustomers = await Customer.find()
            .sort({ totalAmountSpent: -1 })
            .limit(10)
            .select('name phone totalPurchases totalAmountSpent lastPurchaseDate');

        res.json({
            success: true,
            data: {
                totalCustomers,
                newCustomersThisMonth,
                monthlyGrowth,
                topCustomers,
            },
        });
    } catch (error: any) {
        console.error('Error fetching customer stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching customer stats',
            error: error.message,
        });
    }
};

// Bulk import customers
export const bulkImportCustomers = async (req: Request, res: Response) => {
    try {
        const customers = req.body;

        if (!Array.isArray(customers) || customers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid customer data', // Only one message property
            });
        }

        const results: any[] = [];
        const errors: any[] = [];

        for (const customerData of customers) {
            try {
                const { name, phone, email, address, huid, gstNumber, notes } =
                    customerData;

                if (!name || !phone) {
                    errors.push({
                        customer: customerData,
                        message: 'Name and phone are required', // Changed from 'error' to 'message'
                    });
                    continue;
                }

                // Check if customer exists
                const existingCustomer = await Customer.findOne({ phone });

                if (existingCustomer) {
                    // Update existing customer
                    existingCustomer.name = name;
                    if (email) existingCustomer.email = email;
                    if (address) existingCustomer.address = address;
                    if (huid) existingCustomer.huid = huid;
                    if (gstNumber) existingCustomer.gstNumber = gstNumber;
                    if (notes) existingCustomer.notes = notes;

                    await existingCustomer.save();
                    results.push({
                        id: existingCustomer._id,
                        name: existingCustomer.name,
                        phone: existingCustomer.phone,
                        action: 'updated'
                    });
                } else {
                    // Create new customer
                    const newCustomer = new Customer({
                        name,
                        phone,
                        email: email || undefined,
                        address: address || undefined,
                        huid: huid || undefined,
                        gstNumber: gstNumber || undefined,
                        notes: notes || undefined,
                        totalPurchases: 0,
                        totalAmountSpent: 0,
                    });
                    await newCustomer.save();
                    results.push({
                        id: newCustomer._id,
                        name: newCustomer.name,
                        phone: newCustomer.phone,
                        action: 'created'
                    });
                }
            } catch (error: any) {
                errors.push({
                    customer: customerData,
                    message: error.message, // Only one message property
                });
            }
        }

        res.json({
            success: true,
            message: 'Bulk import completed',
            data: {
                processed: results.length,
                errors: errors.length,
                results,
                errorDetails: errors.length > 0 ? errors : undefined, // Changed from 'errors' to 'errorDetails'
            },
        });
    } catch (error: any) {
        console.error('Error in bulk import:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during bulk import', // Only one message property
            error: error.message,
        });
    }
};