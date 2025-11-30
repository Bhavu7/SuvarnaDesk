import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import { comparePassword } from "../utils/hashPassword";

interface AuthRequest extends Request {
    admin?: {
        adminId: string;
        role: string;
        email: string;
    };
}

// Helper function to format toast notifications
const formatToastResponse = (type: 'success' | 'error', message: string, data?: any) => {
    return {
        toast: {
            type,
            message,
            timestamp: new Date().toISOString()
        },
        ...data
    };
};

// Register Admin (for initial setup only)
export const registerAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, role = "admin" } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json(
                formatToastResponse('error', 'Name, email, and password are required')
            );
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json(
                formatToastResponse('error', 'An admin with this email already exists')
            );
        }

        // Create new admin
        const admin = new Admin({
            name,
            email,
            phone,
            password,
            role,
            memberSince: new Date(),
        });

        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                adminId: admin._id,
                role: admin.role,
                email: admin.email
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        res.status(201).json(
            formatToastResponse('success', 'Admin registered successfully', {
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    phone: admin.phone,
                    memberSince: admin.memberSince
                }
            })
        );
    } catch (error: any) {
        console.error("Admin registration error:", error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json(
                formatToastResponse('error', 'This email is already registered')
            );
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json(
                formatToastResponse('error', `Validation failed: ${errors.join(', ')}`)
            );
        }

        res.status(500).json(
            formatToastResponse('error', 'Failed to register admin. Please try again.')
        );
    }
};

// Login Admin
export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json(
                formatToastResponse('error', 'Email and password are required')
            );
        }

        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json(
                formatToastResponse('error', 'Invalid email or password')
            );
        }

        // Check password
        const isPasswordValid = await comparePassword(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json(
                formatToastResponse('error', 'Invalid email or password')
            );
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                adminId: admin._id,
                role: admin.role,
                email: admin.email
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        res.json(
            formatToastResponse('success', 'Login successful! Welcome back.', {
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    phone: admin.phone,
                    memberSince: admin.memberSince,
                    lastLogin: admin.lastLogin
                }
            })
        );
    } catch (error: any) {
        console.error("Admin login error:", error);
        res.status(500).json(
            formatToastResponse('error', 'Login failed. Please try again.')
        );
    }
};

// Get Admin Profile
export const getAdminProfile = async (req: AuthRequest, res: Response) => {
    try {
        const admin = await Admin.findById(req.admin?.adminId).select("-password");
        if (!admin) {
            return res.status(404).json(
                formatToastResponse('error', 'Admin profile not found')
            );
        }

        res.json(
            formatToastResponse('success', 'Profile loaded successfully', {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    phone: admin.phone,
                    memberSince: admin.memberSince,
                    lastLogin: admin.lastLogin,
                    shopName: admin.shopName,
                    address: admin.address,
                    gstNumber: admin.gstNumber,
                    logoUrl: admin.logoUrl,
                    ownerName: admin.ownerName
                }
            })
        );
    } catch (error: any) {
        console.error("Get profile error:", error);
        res.status(500).json(
            formatToastResponse('error', 'Failed to load profile')
        );
    }
};

// Update Admin Profile
export const updateAdminProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, phone } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json(
                formatToastResponse('error', 'Name is required')
            );
        }

        const admin = await Admin.findByIdAndUpdate(
            req.admin?.adminId,
            { name, phone },
            { new: true, runValidators: true }
        ).select("-password");

        if (!admin) {
            return res.status(404).json(
                formatToastResponse('error', 'Admin not found')
            );
        }

        res.json(
            formatToastResponse('success', 'Profile updated successfully', {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    phone: admin.phone,
                    memberSince: admin.memberSince,
                    lastLogin: admin.lastLogin
                }
            })
        );
    } catch (error: any) {
        console.error("Update profile error:", error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json(
                formatToastResponse('error', `Update failed: ${errors.join(', ')}`)
            );
        }

        res.status(500).json(
            formatToastResponse('error', 'Failed to update profile')
        );
    }
};

// Change Password
export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json(
                formatToastResponse('error', 'Current password and new password are required')
            );
        }

        if (newPassword.length < 6) {
            return res.status(400).json(
                formatToastResponse('error', 'New password must be at least 6 characters long')
            );
        }

        const admin = await Admin.findById(req.admin?.adminId);
        if (!admin) {
            return res.status(404).json(
                formatToastResponse('error', 'Admin not found')
            );
        }

        // Verify current password
        const isCurrentPasswordValid = await comparePassword(currentPassword, admin.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json(
                formatToastResponse('error', 'Current password is incorrect')
            );
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        res.json(
            formatToastResponse('success', 'Password changed successfully')
        );
    } catch (error: any) {
        console.error("Change password error:", error);
        res.status(500).json(
            formatToastResponse('error', 'Failed to change password')
        );
    }
};

// Get Shop Settings
export const getShopSettings = async (req: AuthRequest, res: Response) => {
    try {
        const admin = await Admin.findById(req.admin?.adminId).select("shopName address gstNumber logoUrl ownerName");
        if (!admin) {
            return res.status(404).json(
                formatToastResponse('error', 'Admin not found')
            );
        }

        res.json(
            formatToastResponse('success', 'Shop settings loaded successfully', {
                shopSettings: {
                    shopName: admin.shopName,
                    address: admin.address,
                    gstNumber: admin.gstNumber,
                    logoUrl: admin.logoUrl,
                    ownerName: admin.ownerName
                }
            })
        );
    } catch (error: any) {
        console.error("Get shop settings error:", error);
        res.status(500).json(
            formatToastResponse('error', 'Failed to load shop settings')
        );
    }
};

// Update Shop Settings
export const updateShopSettings = async (req: AuthRequest, res: Response) => {
    try {
        const { shopName, address, gstNumber, logoUrl, ownerName } = req.body;

        // Validation
        if (!shopName) {
            return res.status(400).json(
                formatToastResponse('error', 'Shop name is required')
            );
        }

        const admin = await Admin.findByIdAndUpdate(
            req.admin?.adminId,
            { shopName, address, gstNumber, logoUrl, ownerName },
            { new: true, runValidators: true }
        ).select("shopName address gstNumber logoUrl ownerName");

        if (!admin) {
            return res.status(404).json(
                formatToastResponse('error', 'Admin not found')
            );
        }

        res.json(
            formatToastResponse('success', 'Shop settings updated successfully', {
                shopSettings: {
                    shopName: admin.shopName,
                    address: admin.address,
                    gstNumber: admin.gstNumber,
                    logoUrl: admin.logoUrl,
                    ownerName: admin.ownerName
                }
            })
        );
    } catch (error: any) {
        console.error("Update shop settings error:", error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json(
                formatToastResponse('error', `Update failed: ${errors.join(', ')}`)
            );
        }

        res.status(500).json(
            formatToastResponse('error', 'Failed to update shop settings')
        );
    }
};

// Verify Token
export const verifyToken = async (req: AuthRequest, res: Response) => {
    try {
        const admin = await Admin.findById(req.admin?.adminId).select("-password");
        if (!admin) {
            return res.status(404).json(
                formatToastResponse('error', 'Admin not found')
            );
        }

        res.json(
            formatToastResponse('success', 'Token is valid', {
                valid: true,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    phone: admin.phone
                }
            })
        );
    } catch (error: any) {
        console.error("Token verification error:", error);
        res.status(500).json(
            formatToastResponse('error', 'Token verification failed')
        );
    }
};