import ShopSettings from "../models/Settings";
import { Request, Response } from "express";

export const getShopSettings = async (req: Request, res: Response) => {
    try {
        let settings = await ShopSettings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = new ShopSettings({
                shopName: "SuvarnaDesk",
                ownerName: "Admin",
                address: "Anand, Gujarat, India",
                phone: "+91 12345 67890",
            });
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        console.error('Error in getShopSettings:', error);
        res.status(500).json({ error: "Failed to get shop settings" });
    }
};

export const updateShopSettings = async (req: Request, res: Response) => {
    try {
        let settings = await ShopSettings.findOne();

        if (!settings) {
            // Create new settings if none exist
            settings = new ShopSettings(req.body);
        } else {
            // Update existing settings
            const updatedSettings = await ShopSettings.findOneAndUpdate(
                {},
                req.body,
                { new: true }
            );

            // Handle case where findOneAndUpdate returns null
            if (!updatedSettings) {
                return res.status(500).json({ error: "Failed to update shop settings" });
            }

            settings = updatedSettings;
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        console.error('Error in updateShopSettings:', error);
        res.status(500).json({ error: "Failed to update shop settings" });
    }
};