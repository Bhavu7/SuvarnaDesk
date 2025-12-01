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

        // Return settings
        res.json({
            shopName: settings.shopName,
            ownerName: settings.ownerName,
            address: settings.address,
            phone: settings.phone,
            goldGstNumber: settings.goldGstNumber || "",
            silverGstNumber: settings.silverGstNumber || "",
            logoUrl: settings.logoUrl || "",
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt
        });
    } catch (error) {
        console.error('Error in getShopSettings:', error);
        res.status(500).json({ error: "Failed to get shop settings" });
    }
};

export const updateShopSettings = async (req: Request, res: Response) => {
    try {
        const {
            shopName,
            ownerName,
            address,
            phone,
            goldGstNumber,
            silverGstNumber,
            logoUrl
        } = req.body;

        // Validate required fields
        if (!shopName || !ownerName || !address || !phone) {
            return res.status(400).json({
                error: "Missing required fields: shopName, ownerName, address, phone"
            });
        }

        // Optional: Validate GST format if provided
        if (goldGstNumber && goldGstNumber.trim()) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
            if (!gstRegex.test(goldGstNumber)) {
                return res.status(400).json({
                    error: "Invalid Gold GST number format",
                    message: "GST number should be 15 characters (e.g., 22AAAAA0000A1Z5)"
                });
            }
        }

        if (silverGstNumber && silverGstNumber.trim()) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
            if (!gstRegex.test(silverGstNumber)) {
                return res.status(400).json({
                    error: "Invalid Silver GST number format",
                    message: "GST number should be 15 characters (e.g., 22AAAAA0000A1Z5)"
                });
            }
        }

        let settings = await ShopSettings.findOne();

        if (!settings) {
            // Create new settings
            settings = new ShopSettings({
                shopName,
                ownerName,
                address,
                phone,
                goldGstNumber,
                silverGstNumber,
                logoUrl
            });
        } else {
            // Update existing settings
            settings.shopName = shopName;
            settings.ownerName = ownerName;
            settings.address = address;
            settings.phone = phone;
            settings.goldGstNumber = goldGstNumber;
            settings.silverGstNumber = silverGstNumber;
            settings.logoUrl = logoUrl;
        }

        await settings.save();

        // Return updated settings
        res.json({
            shopName: settings.shopName,
            ownerName: settings.ownerName,
            address: settings.address,
            phone: settings.phone,
            goldGstNumber: settings.goldGstNumber || "",
            silverGstNumber: settings.silverGstNumber || "",
            logoUrl: settings.logoUrl || "",
            updatedAt: settings.updatedAt
        });
    } catch (error) {
        console.error('Error in updateShopSettings:', error);
        res.status(500).json({ error: "Failed to update shop settings" });
    }
};

// Migration function to remove old gstNumber field (run once if needed)
export const cleanupOldGstField = async () => {
    try {
        // If you have existing documents with gstNumber field, update them
        const result = await ShopSettings.updateMany(
            { gstNumber: { $exists: true } },
            [
                {
                    $set: {
                        goldGstNumber: "$gstNumber",
                        silverGstNumber: "$gstNumber"
                    }
                },
                {
                    $unset: "gstNumber"
                }
            ]
        );

        console.log(`Migrated ${result.modifiedCount} documents`);
        return result;
    } catch (error) {
        console.error('Error cleaning up old GST field:', error);
        throw error;
    }
};

// Optional: Run this once to clean up old field
// cleanupOldGstField();