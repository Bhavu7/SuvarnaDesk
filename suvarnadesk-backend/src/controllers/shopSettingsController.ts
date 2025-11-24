import ShopSettings from "../models/ShopSettings";
import { Request, Response } from "express";

export const getShopSettings = async (req: Request, res: Response) => {
    let settings = await ShopSettings.findOne();
    if (!settings) {
        // Create default settings if none exist
        settings = new ShopSettings({
            shopName: "My Jewelry Shop",
            address: "Add your shop address",
            phone: "+1234567890"
        });
        await settings.save();
    }
    res.json(settings);
};

export const updateShopSettings = async (req: Request, res: Response) => {
    let settings = await ShopSettings.findOne();

    if (!settings) {
        settings = new ShopSettings(req.body);
    } else {
        settings = await ShopSettings.findOneAndUpdate({}, req.body, { new: true });
    }

    await settings.save();
    res.json(settings);
};