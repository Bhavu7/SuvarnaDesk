import Admin from "../models/Admin";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

// POST /api/admin/login
export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await comparePassword(password, admin.password!);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { adminId: admin._id, role: admin.role },
        process.env.JWT_SECRET!,
        { expiresIn: "12h" }
    );

    res.json({
        token,
        admin: {
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            role: admin.role
        }
    });
};

// POST /api/admin/register (only for initial setup)
export const registerAdmin = async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: "Admin already exists" });

    const hash = await hashPassword(password);
    const admin = new Admin({ name, email, password: hash, phone });
    await admin.save();
    res.status(201).json({ name: admin.name, email: admin.email, phone: admin.phone, role: admin.role });
};

// GET /api/admin/profile
export const getAdminProfile = async (req: Request, res: Response) => {
    const adminId = (req as any).admin.adminId;
    const admin = await Admin.findById(adminId).select("-password");
    if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
    }
    res.json(admin);
};

// PUT /api/admin/profile
export const updateAdminProfile = async (req: Request, res: Response) => {
    const adminId = (req as any).admin.adminId;
    const { name, email, phone } = req.body;

    // Optional uniqueness check if email changed
    if (email) {
        const existingAdminWithEmail = await Admin.findOne({ email });
        if (existingAdminWithEmail && existingAdminWithEmail._id.toString() !== adminId) {
            return res.status(400).json({ error: "Email already in use" });
        }
    }

    const admin = await Admin.findByIdAndUpdate(
        adminId,
        { name, email, phone },
        { new: true }
    ).select("-password");

    if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
    }
    res.json(admin);
};


// GET /api/admin/verify
export const verifyToken = async (req: Request, res: Response) => {
    try {
        // The admin is already attached to req by authMiddleware
        const adminId = (req as any).admin.adminId;

        // Fetch fresh admin data from database
        const admin = await Admin.findById(adminId).select("-password");

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        res.json({
            valid: true,
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                shopName: admin.shopName,
                gstNumber: admin.gstNumber,
                // Add any other fields you need
            }
        });
    } catch (error) {
        console.error("Verify token error:", error);
        res.status(500).json({ error: "Server error during token verification" });
    }
};


// PATCH /api/admin/change-password
export const changePassword = async (req: Request, res: Response) => {
    const adminId = (req as any).admin.adminId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Both current and new password are required" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Current password is incorrect" });

    admin.password = await hashPassword(newPassword);
    await admin.save();

    res.json({ message: "Password changed successfully" });
};

// GET /api/admin/shop-settings
export const getShopSettings = async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).admin.adminId;
        const admin = await Admin.findById(adminId).select("shopName address phone gstNumber logoUrl ownerName");
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }
        res.json({
            shopName: admin.shopName || "",
            address: admin.address || "",
            phone: admin.phone || "",
            gstNumber: admin.gstNumber || "",
            logoUrl: admin.logoUrl || "",
            ownerName: admin.ownerName || "",
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// PUT /api/admin/shop-settings
export const updateShopSettings = async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).admin.adminId;
        const { shopName, address, phone, gstNumber, logoUrl, ownerName } = req.body;

        const admin = await Admin.findByIdAndUpdate(
            adminId,
            { shopName, address, phone, gstNumber, logoUrl, ownerName },
            { new: true }
        ).select("shopName address phone gstNumber logoUrl ownerName");

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};