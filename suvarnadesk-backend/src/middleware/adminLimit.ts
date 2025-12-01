// middleware/adminLimit.ts
import { Request, Response, NextFunction } from "express";
import Admin from "../models/Admin";

const MAX_ADMINS = 4;

export const checkAdminLimit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminCount = await Admin.countDocuments({ isActive: true });

        if (adminCount >= MAX_ADMINS) {
            return res.status(400).json({
                toast: {
                    type: 'error',
                    message: `Maximum limit of ${MAX_ADMINS} admins reached. Cannot create more admins.`
                },
                maxLimit: MAX_ADMINS,
                currentCount: adminCount
            });
        }
        next();
    } catch (error) {
        console.error("Admin limit check error:", error);
        res.status(500).json({
            toast: {
                type: 'error',
                message: 'Error checking admin limit'
            }
        });
    }
};

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const adminCount = await Admin.countDocuments({ isActive: true });
        const superAdminCount = await Admin.countDocuments({
            role: 'super_admin',
            isActive: true
        });

        res.json({
            adminCount,
            superAdminCount,
            maxLimit: MAX_ADMINS,
            canAddMore: adminCount < MAX_ADMINS,
            availableSlots: MAX_ADMINS - adminCount
        });
    } catch (error) {
        console.error("Get admin stats error:", error);
        res.status(500).json({
            toast: {
                type: 'error',
                message: 'Failed to get admin statistics'
            }
        });
    }
};