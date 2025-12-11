import { Request, Response } from 'express';
import RepairReceipt from '../models/RepairReceipt';

export const createRepairReceipt = async (req: Request, res: Response) => {
    try {
        const {
            receiptNumber,
            receiptDateTime,
            paymentMethod,
            customerName,
            customerAddress,
            companyName,
            companyAddress,
            items,
            salespersonName,
            tax,
            subtotal,
            taxAmount,
            total,
            shopSettings
        } = req.body;

        // Validate required fields
        if (!receiptNumber || !customerName || !customerAddress || !salespersonName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one item is required'
            });
        }

        // Check if receipt number already exists
        const existingReceipt = await RepairReceipt.findOne({ receiptNumber });
        if (existingReceipt) {
            return res.status(400).json({
                success: false,
                message: 'Receipt number already exists'
            });
        }

        // Create new receipt
        const receipt = new RepairReceipt({
            receiptNumber,
            receiptDateTime: new Date(receiptDateTime),
            paymentMethod,
            customerName,
            customerAddress,
            companyName,
            companyAddress,
            items,
            salespersonName,
            tax,
            subtotal,
            taxAmount,
            total,
            shopSettings: shopSettings || {}
        });

        await receipt.save();

        res.status(201).json({
            success: true,
            message: 'Repair receipt created successfully',
            data: receipt
        });
    } catch (error: any) {
        console.error('Error creating repair receipt:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Receipt number already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create repair receipt',
            error: error.message
        });
    }
};

export const getRepairReceipts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search, startDate, endDate, itemType } = req.query;

        const query: any = {};

        // Search by customer name or receipt number
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { receiptNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by date range
        if (startDate && endDate) {
            query.receiptDateTime = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        // Filter by item type
        if (itemType) {
            query['items.itemType'] = itemType;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const receipts = await RepairReceipt.find(query)
            .sort({ receiptDateTime: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await RepairReceipt.countDocuments(query);

        res.status(200).json({
            success: true,
            data: receipts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Error fetching repair receipts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch repair receipts',
            error: error.message
        });
    }
};

export const getRepairReceiptById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const receipt = await RepairReceipt.findById(id);

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        res.status(200).json({
            success: true,
            data: receipt
        });
    } catch (error: any) {
        console.error('Error fetching repair receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch repair receipt',
            error: error.message
        });
    }
};

export const updateRepairReceipt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Don't allow updating receipt number
        if (updateData.receiptNumber) {
            delete updateData.receiptNumber;
        }

        const receipt = await RepairReceipt.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Receipt updated successfully',
            data: receipt
        });
    } catch (error: any) {
        console.error('Error updating repair receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update repair receipt',
            error: error.message
        });
    }
};

export const deleteRepairReceipt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const receipt = await RepairReceipt.findByIdAndDelete(id);

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Receipt deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting repair receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete repair receipt',
            error: error.message
        });
    }
};

export const getReceiptStats = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const query: any = {};
        if (startDate && endDate) {
            query.receiptDateTime = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        const stats = await RepairReceipt.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalReceipts: { $sum: 1 },
                    totalAmount: { $sum: '$total' },
                    totalTax: { $sum: '$taxAmount' },
                    goldItems: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$items',
                                    as: 'item',
                                    cond: { $eq: ['$$item.itemType', 'gold'] }
                                }
                            }
                        }
                    },
                    silverItems: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$items',
                                    as: 'item',
                                    cond: { $eq: ['$$item.itemType', 'silver'] }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || {
                totalReceipts: 0,
                totalAmount: 0,
                totalTax: 0,
                goldItems: 0,
                silverItems: 0
            }
        });
    } catch (error: any) {
        console.error('Error fetching receipt stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch receipt statistics',
            error: error.message
        });
    }
};