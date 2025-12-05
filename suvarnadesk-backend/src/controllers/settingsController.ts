import ShopSettings from "../models/Settings";
import { Request, Response } from "express";

// GST validation regex
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

// PAN validation regex
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// IFSC validation regex
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const validateGstNumber = (gstNumber: string | undefined): { isValid: boolean; error?: string } => {
    if (!gstNumber || gstNumber.trim() === "") {
        return { isValid: true };
    }

    if (!GST_REGEX.test(gstNumber)) {
        return {
            isValid: false,
            error: "GST number should be 15 characters in format: 22AAAAA0000A1Z5"
        };
    }

    return { isValid: true };
};

const validatePanNumber = (panNumber: string | undefined): { isValid: boolean; error?: string } => {
    if (!panNumber || panNumber.trim() === "") {
        return { isValid: true };
    }

    if (!PAN_REGEX.test(panNumber.toUpperCase())) {
        return {
            isValid: false,
            error: "PAN number should be 10 characters in format: ABCDE1234F"
        };
    }

    return { isValid: true };
};

const validateIfscCode = (ifscCode: string | undefined): { isValid: boolean; error?: string } => {
    if (!ifscCode || ifscCode.trim() === "") {
        return { isValid: true };
    }

    if (!IFSC_REGEX.test(ifscCode.toUpperCase())) {
        return {
            isValid: false,
            error: "IFSC code should be 11 characters in format: GSCB0USGUNJ"
        };
    }

    return { isValid: true };
};

const validateAccountNumber = (accountNo: string | undefined): { isValid: boolean; error?: string } => {
    if (!accountNo || accountNo.trim() === "") {
        return { isValid: true };
    }

    // Basic account number validation (9-18 digits)
    const accountRegex = /^[0-9]{9,18}$/;
    if (!accountRegex.test(accountNo)) {
        return {
            isValid: false,
            error: "Account number should be 9-18 digits"
        };
    }

    return { isValid: true };
};

export const getShopSettings = async (req: Request, res: Response) => {
    try {
        const settings = await ShopSettings.findOne();

        if (!settings) {
            return res.status(404).json({
                error: "Shop settings not found",
                message: "No shop settings configured yet. Please set up your shop details."
            });
        }

        // Return settings with all fields
        res.json({
            shopName: settings.shopName,
            ownerName: settings.ownerName,
            goldOwnerName: settings.goldOwnerName || "Jay Krushna Haribhai Soni",
            silverOwnerName: settings.silverOwnerName || "M/s Yogeshkumar and Brothers",
            address: settings.address,
            phone: settings.phone,
            goldGstNumber: settings.goldGstNumber || "",
            silverGstNumber: settings.silverGstNumber || "",
            goldPanNumber: settings.goldPanNumber || "",
            silverPanNumber: settings.silverPanNumber || "",

            // Gold Bank Details
            goldBankName: settings.goldBankName || "SardarGunj Mercantile Co. Operative Bank Ltd.",
            goldBankBranch: settings.goldBankBranch || "Anand",
            goldBankIfsc: settings.goldBankIfsc || "GSCB0USGUNJ",
            goldBankAccountNo: settings.goldBankAccountNo || "802001002002303",

            // Silver Bank Details
            silverBankName: settings.silverBankName || "SardarGunj Mercantile Co. Operative Bank Ltd.",
            silverBankBranch: settings.silverBankBranch || "Anand",
            silverBankIfsc: settings.silverBankIfsc || "GSCB0USGUNJ",
            silverBankAccountNo: settings.silverBankAccountNo || "802001002001532",

            logoUrl: settings.logoUrl || "",
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt
        });
    } catch (error) {
        console.error('Error in getShopSettings:', error);
        res.status(500).json({
            error: "Failed to get shop settings",
            message: "An internal server error occurred"
        });
    }
};

export const updateShopSettings = async (req: Request, res: Response) => {
    try {
        const {
            shopName,
            ownerName,
            goldOwnerName,
            silverOwnerName,
            address,
            phone,
            goldGstNumber,
            silverGstNumber,
            goldPanNumber,
            silverPanNumber,

            // Gold Bank Details
            goldBankName,
            goldBankBranch,
            goldBankIfsc,
            goldBankAccountNo,

            // Silver Bank Details
            silverBankName,
            silverBankBranch,
            silverBankIfsc,
            silverBankAccountNo,

            logoUrl
        } = req.body;

        // Validate required fields
        if (!shopName?.trim()) {
            return res.status(400).json({
                error: "Missing required field: shopName"
            });
        }

        if (!ownerName?.trim()) {
            return res.status(400).json({
                error: "Missing required field: ownerName"
            });
        }

        if (!goldOwnerName?.trim()) {
            return res.status(400).json({
                error: "Missing required field: goldOwnerName"
            });
        }

        if (!silverOwnerName?.trim()) {
            return res.status(400).json({
                error: "Missing required field: silverOwnerName"
            });
        }

        if (!address?.trim()) {
            return res.status(400).json({
                error: "Missing required field: address"
            });
        }

        if (!phone?.trim()) {
            return res.status(400).json({
                error: "Missing required field: phone"
            });
        }

        // Validate GST numbers if provided
        const goldGstValidation = validateGstNumber(goldGstNumber);
        if (!goldGstValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Gold GST number",
                message: goldGstValidation.error
            });
        }

        const silverGstValidation = validateGstNumber(silverGstNumber);
        if (!silverGstValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Silver GST number",
                message: silverGstValidation.error
            });
        }

        // Validate PAN numbers if provided
        const goldPanValidation = validatePanNumber(goldPanNumber);
        if (!goldPanValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Gold PAN number",
                message: goldPanValidation.error
            });
        }

        const silverPanValidation = validatePanNumber(silverPanNumber);
        if (!silverPanValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Silver PAN number",
                message: silverPanValidation.error
            });
        }

        // Validate IFSC codes if provided
        const goldIfscValidation = validateIfscCode(goldBankIfsc);
        if (!goldIfscValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Gold IFSC code",
                message: goldIfscValidation.error
            });
        }

        const silverIfscValidation = validateIfscCode(silverBankIfsc);
        if (!silverIfscValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Silver IFSC code",
                message: silverIfscValidation.error
            });
        }

        // Validate account numbers if provided
        const goldAccountValidation = validateAccountNumber(goldBankAccountNo);
        if (!goldAccountValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Gold account number",
                message: goldAccountValidation.error
            });
        }

        const silverAccountValidation = validateAccountNumber(silverBankAccountNo);
        if (!silverAccountValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Silver account number",
                message: silverAccountValidation.error
            });
        }

        // Check if settings exist
        let settings = await ShopSettings.findOne();

        if (!settings) {
            // Create new settings
            settings = new ShopSettings({
                shopName: shopName.trim(),
                ownerName: ownerName.trim(),
                goldOwnerName: goldOwnerName.trim(),
                silverOwnerName: silverOwnerName.trim(),
                address: address.trim(),
                phone: phone.trim(),
                goldGstNumber: goldGstNumber?.trim() || "",
                silverGstNumber: silverGstNumber?.trim() || "",
                goldPanNumber: goldPanNumber?.trim() || "",
                silverPanNumber: silverPanNumber?.trim() || "",

                // Gold Bank Details
                goldBankName: goldBankName?.trim() || "SardarGunj Mercantile Co. Operative Bank Ltd.",
                goldBankBranch: goldBankBranch?.trim() || "Anand",
                goldBankIfsc: goldBankIfsc?.trim() || "GSCB0USGUNJ",
                goldBankAccountNo: goldBankAccountNo?.trim() || "802001002002303",

                // Silver Bank Details
                silverBankName: silverBankName?.trim() || "SardarGunj Mercantile Co. Operative Bank Ltd.",
                silverBankBranch: silverBankBranch?.trim() || "Anand",
                silverBankIfsc: silverBankIfsc?.trim() || "GSCB0USGUNJ",
                silverBankAccountNo: silverBankAccountNo?.trim() || "802001002001532",

                logoUrl: logoUrl?.trim() || ""
            });
        } else {
            // Update existing settings
            settings.shopName = shopName.trim();
            settings.ownerName = ownerName.trim();
            settings.goldOwnerName = goldOwnerName.trim();
            settings.silverOwnerName = silverOwnerName.trim();
            settings.address = address.trim();
            settings.phone = phone.trim();
            settings.goldGstNumber = goldGstNumber?.trim() || "";
            settings.silverGstNumber = silverGstNumber?.trim() || "";
            settings.goldPanNumber = goldPanNumber?.trim() || "";
            settings.silverPanNumber = silverPanNumber?.trim() || "";

            // Gold Bank Details
            settings.goldBankName = goldBankName?.trim() || "SardarGunj Mercantile Co. Operative Bank Ltd.";
            settings.goldBankBranch = goldBankBranch?.trim() || "Anand";
            settings.goldBankIfsc = goldBankIfsc?.trim() || "GSCB0USGUNJ";
            settings.goldBankAccountNo = goldBankAccountNo?.trim() || "802001002002303";

            // Silver Bank Details
            settings.silverBankName = silverBankName?.trim() || "SardarGunj Mercantile Co. Operative Bank Ltd.";
            settings.silverBankBranch = silverBankBranch?.trim() || "Anand";
            settings.silverBankIfsc = silverBankIfsc?.trim() || "GSCB0USGUNJ";
            settings.silverBankAccountNo = silverBankAccountNo?.trim() || "802001002001532";

            settings.logoUrl = logoUrl?.trim() || "";
        }

        await settings.save();

        // Return updated settings
        res.status(200).json({
            success: true,
            message: "Shop settings saved successfully",
            data: {
                shopName: settings.shopName,
                ownerName: settings.ownerName,
                goldOwnerName: settings.goldOwnerName,
                silverOwnerName: settings.silverOwnerName,
                address: settings.address,
                phone: settings.phone,
                goldGstNumber: settings.goldGstNumber || "",
                silverGstNumber: settings.silverGstNumber || "",
                goldPanNumber: settings.goldPanNumber || "",
                silverPanNumber: settings.silverPanNumber || "",

                // Gold Bank Details
                goldBankName: settings.goldBankName,
                goldBankBranch: settings.goldBankBranch,
                goldBankIfsc: settings.goldBankIfsc,
                goldBankAccountNo: settings.goldBankAccountNo,

                // Silver Bank Details
                silverBankName: settings.silverBankName,
                silverBankBranch: settings.silverBankBranch,
                silverBankIfsc: settings.silverBankIfsc,
                silverBankAccountNo: settings.silverBankAccountNo,

                logoUrl: settings.logoUrl || "",
                updatedAt: settings.updatedAt
            }
        });
    } catch (error) {
        console.error('Error in updateShopSettings:', error);
        res.status(500).json({
            error: "Failed to update shop settings",
            message: "An internal server error occurred"
        });
    }
};

export const createInitialSettings = async (req: Request, res: Response) => {
    try {
        const existingSettings = await ShopSettings.findOne();

        if (existingSettings) {
            return res.status(400).json({
                error: "Settings already exist",
                message: "Shop settings are already configured. Use the update endpoint instead."
            });
        }

        const {
            shopName,
            ownerName,
            goldOwnerName,
            silverOwnerName,
            address,
            phone,
            goldGstNumber,
            silverGstNumber,
            goldPanNumber,
            silverPanNumber,

            // Gold Bank Details
            goldBankName,
            goldBankBranch,
            goldBankIfsc,
            goldBankAccountNo,

            // Silver Bank Details
            silverBankName,
            silverBankBranch,
            silverBankIfsc,
            silverBankAccountNo,

            logoUrl
        } = req.body;

        // Validate required fields
        if (!shopName?.trim() || !ownerName?.trim() || !goldOwnerName?.trim() ||
            !silverOwnerName?.trim() || !address?.trim() || !phone?.trim()) {
            return res.status(400).json({
                error: "Missing required fields: shopName, ownerName, goldOwnerName, silverOwnerName, address, phone"
            });
        }

        // Validate GST numbers if provided
        const goldGstValidation = validateGstNumber(goldGstNumber);
        if (!goldGstValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Gold GST number",
                message: goldGstValidation.error
            });
        }

        const silverGstValidation = validateGstNumber(silverGstNumber);
        if (!silverGstValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Silver GST number",
                message: silverGstValidation.error
            });
        }

        // Validate PAN numbers if provided
        const goldPanValidation = validatePanNumber(goldPanNumber);
        if (!goldPanValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Gold PAN number",
                message: goldPanValidation.error
            });
        }

        const silverPanValidation = validatePanNumber(silverPanNumber);
        if (!silverPanValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Silver PAN number",
                message: silverPanValidation.error
            });
        }

        // Validate IFSC codes if provided
        const goldIfscValidation = validateIfscCode(goldBankIfsc);
        if (!goldIfscValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Gold IFSC code",
                message: goldIfscValidation.error
            });
        }

        const silverIfscValidation = validateIfscCode(silverBankIfsc);
        if (!silverIfscValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Silver IFSC code",
                message: silverIfscValidation.error
            });
        }

        // Validate account numbers if provided
        const goldAccountValidation = validateAccountNumber(goldBankAccountNo);
        if (!goldAccountValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Gold account number",
                message: goldAccountValidation.error
            });
        }

        const silverAccountValidation = validateAccountNumber(silverBankAccountNo);
        if (!silverAccountValidation.isValid) {
            return res.status(400).json({
                error: "Invalid Silver account number",
                message: silverAccountValidation.error
            });
        }

        // Create new settings
        const settings = new ShopSettings({
            shopName: shopName.trim(),
            ownerName: ownerName.trim(),
            goldOwnerName: goldOwnerName.trim(),
            silverOwnerName: silverOwnerName.trim(),
            address: address.trim(),
            phone: phone.trim(),
            goldGstNumber: goldGstNumber?.trim() || "",
            silverGstNumber: silverGstNumber?.trim() || "",
            goldPanNumber: goldPanNumber?.trim() || "",
            silverPanNumber: silverPanNumber?.trim() || "",

            // Gold Bank Details
            goldBankName: goldBankName?.trim() || "SardarGunj Mercantile Co. Operative Bank Ltd.",
            goldBankBranch: goldBankBranch?.trim() || "Anand",
            goldBankIfsc: goldBankIfsc?.trim() || "GSCB0USGUNJ",
            goldBankAccountNo: goldBankAccountNo?.trim() || "802001002002303",

            // Silver Bank Details
            silverBankName: silverBankName?.trim() || "SardarGunj Mercantile Co. Operative Bank Ltd.",
            silverBankBranch: silverBankBranch?.trim() || "Anand",
            silverBankIfsc: silverBankIfsc?.trim() || "GSCB0USGUNJ",
            silverBankAccountNo: silverBankAccountNo?.trim() || "802001002001532",

            logoUrl: logoUrl?.trim() || ""
        });

        await settings.save();

        res.status(201).json({
            success: true,
            message: "Shop settings created successfully",
            data: {
                shopName: settings.shopName,
                ownerName: settings.ownerName,
                goldOwnerName: settings.goldOwnerName,
                silverOwnerName: settings.silverOwnerName,
                address: settings.address,
                phone: settings.phone,
                goldGstNumber: settings.goldGstNumber || "",
                silverGstNumber: settings.silverGstNumber || "",
                goldPanNumber: settings.goldPanNumber || "",
                silverPanNumber: settings.silverPanNumber || "",

                // Gold Bank Details
                goldBankName: settings.goldBankName,
                goldBankBranch: settings.goldBankBranch,
                goldBankIfsc: settings.goldBankIfsc,
                goldBankAccountNo: settings.goldBankAccountNo,

                // Silver Bank Details
                silverBankName: settings.silverBankName,
                silverBankBranch: settings.silverBankBranch,
                silverBankIfsc: settings.silverBankIfsc,
                silverBankAccountNo: settings.silverBankAccountNo,

                logoUrl: settings.logoUrl || "",
                createdAt: settings.createdAt
            }
        });
    } catch (error) {
        console.error('Error in createInitialSettings:', error);
        res.status(500).json({
            error: "Failed to create shop settings",
            message: "An internal server error occurred"
        });
    }
};