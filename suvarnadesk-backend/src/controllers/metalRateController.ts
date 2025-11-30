import { Request, Response } from 'express';
import MetalRate from '../models/MetalRate';

// Get all metal rates
export const getMetalRates = async (req: Request, res: Response) => {
    try {
        const metalRates = await MetalRate.find().sort({ effectiveFrom: -1 });
        res.json(metalRates);
    } catch (error) {
        console.error('Error fetching metal rates:', error);
        res.status(500).json({ error: 'Failed to fetch metal rates' });
    }
};

// Get active metal rates
export const getActiveMetalRates = async (req: Request, res: Response) => {
    try {
        const metalRates = await MetalRate.find({ isActive: true }).sort({ effectiveFrom: -1 });
        res.json(metalRates);
    } catch (error) {
        console.error('Error fetching active metal rates:', error);
        res.status(500).json({ error: 'Failed to fetch active metal rates' });
    }
};

// Create new metal rate
export const createMetalRate = async (req: Request, res: Response) => {
    try {
        const { metalType, purity, ratePerGram, effectiveFrom, source } = req.body;

        // Validate required fields
        if (!metalType || !purity || !ratePerGram || !effectiveFrom) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Deactivate previous rates for the same metal type and purity
        await MetalRate.updateMany(
            { metalType, purity, isActive: true },
            { isActive: false }
        );

        // Create new rate
        const newMetalRate = new MetalRate({
            metalType,
            purity,
            ratePerGram,
            effectiveFrom: new Date(effectiveFrom),
            source: source || 'manual',
            isActive: true
        });

        await newMetalRate.save();
        res.status(201).json(newMetalRate);
    } catch (error) {
        console.error('Error creating metal rate:', error);
        res.status(500).json({ error: 'Failed to create metal rate' });
    }
};

// Update metal rate
export const updateMetalRate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If making a rate active, deactivate others of same type and purity
        if (updateData.isActive === true) {
            const existingRate = await MetalRate.findById(id);
            if (existingRate) {
                await MetalRate.updateMany(
                    {
                        _id: { $ne: id },
                        metalType: existingRate.metalType,
                        purity: existingRate.purity,
                        isActive: true
                    },
                    { isActive: false }
                );
            }
        }

        const updatedRate = await MetalRate.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedRate) {
            return res.status(404).json({ error: 'Metal rate not found' });
        }

        res.json(updatedRate);
    } catch (error) {
        console.error('Error updating metal rate:', error);
        res.status(500).json({ error: 'Failed to update metal rate' });
    }
};

// Delete metal rate
export const deleteMetalRate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedRate = await MetalRate.findByIdAndDelete(id);

        if (!deletedRate) {
            return res.status(404).json({ error: 'Metal rate not found' });
        }

        res.json({ message: 'Metal rate deleted successfully' });
    } catch (error) {
        console.error('Error deleting metal rate:', error);
        res.status(500).json({ error: 'Failed to delete metal rate' });
    }
};

// Get current rates for billing
export const getCurrentRates = async (req: Request, res: Response) => {
    try {
        const currentRates = await MetalRate.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: { metalType: "$metalType", purity: "$purity" },
                    latestRate: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$latestRate" }
            },
            { $sort: { metalType: 1, purity: 1 } }
        ]);

        res.json(currentRates);
    } catch (error) {
        console.error('Error fetching current rates:', error);
        res.status(500).json({ error: 'Failed to fetch current rates' });
    }
};