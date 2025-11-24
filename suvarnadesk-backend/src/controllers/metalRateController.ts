import MetalRate from "../models/MetalRate";
import RateChangeLog from "../models/RateChangeLog";
import { Request, Response } from "express";

export const getMetalRates = async (req: Request, res: Response) => {
    const rates = await MetalRate.find({ isActive: true }).sort({ effectiveFrom: -1 });
    res.json(rates);
};

export const createMetalRate = async (req: Request, res: Response) => {
    const { metalType, purity, ratePerGram, effectiveFrom, source } = req.body;

    // Deactivate old rates for same metal and purity
    await MetalRate.updateMany(
        { metalType, purity, isActive: true },
        { isActive: false }
    );

    const rate = new MetalRate({
        metalType,
        purity,
        ratePerGram,
        effectiveFrom: effectiveFrom || new Date(),
        source
    });

    await rate.save();

    // Log rate change
    const log = new RateChangeLog({
        metalType,
        oldRate: 0, // You might want to get the previous rate
        newRate: ratePerGram,
        changedBy: (req as any).admin.adminId
    });
    await log.save();

    res.status(201).json(rate);
};

export const getCurrentRates = async (req: Request, res: Response) => {
    const currentRates = await MetalRate.aggregate([
        { $match: { isActive: true } },
        { $sort: { effectiveFrom: -1 } },
        {
            $group: {
                _id: { metalType: "$metalType", purity: "$purity" },
                latestRate: { $first: "$$ROOT" }
            }
        }
    ]);

    res.json(currentRates.map(item => item.latestRate));
};