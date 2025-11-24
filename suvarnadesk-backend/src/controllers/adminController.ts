import Admin from "../models/Admin";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

// POST /api/admin/login
export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await comparePassword(password, admin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { adminId: admin._id, role: admin.role },
        process.env.JWT_SECRET!,
        { expiresIn: "12h" }
    );
    res.json({ token, admin });
};

// POST /api/admin/register (only for initial setup)
export const registerAdmin = async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: "Admin already exists" });

    const hash = await hashPassword(password);
    const admin = new Admin({ name, email, password: hash, phone });
    await admin.save();
    res.status(201).json(admin);
};

// GET /api/admin/profile
export const getAdminProfile = async (req: Request, res: Response) => {
    const adminId = (req as any).admin.adminId;
    const admin = await Admin.findById(adminId).select("-password");
    res.json(admin);
};

// PUT /api/admin/profile
export const updateAdminProfile = async (req: Request, res: Response) => {
    const adminId = (req as any).admin.adminId;
    const { name, phone } = req.body;
    const admin = await Admin.findByIdAndUpdate(
        adminId,
        { name, phone },
        { new: true }
    ).select("-password");
    res.json(admin);
};
