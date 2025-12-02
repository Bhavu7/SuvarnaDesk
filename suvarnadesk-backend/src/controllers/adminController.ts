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

const MAX_ADMINS = 4;

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

// Helper function to count active admins
const getActiveAdminCount = async () => {
    return await Admin.countDocuments({ isActive: true });
};

// Get all admins (only for super_admin)
export const getAllAdmins = async (req: AuthRequest, res: Response) => {
    try {
        // Check if requester is super admin
        if (req.admin?.role !== 'super_admin') {
            return res.status(403).json(
                formatToastResponse('error', 'Only super admin can view all admins')
            );
        }

        const admins = await Admin.find({ isActive: true })
            .select('-password')
            .sort({ createdAt: -1 });

        const adminCount = await getActiveAdminCount();

        res.json(
            formatToastResponse('success', 'Admins loaded successfully', {
                admins,
                adminCount,
                maxLimit: MAX_ADMINS,
                canAddMore: adminCount < MAX_ADMINS
            })
        );
    } catch (error: any) {
        console.error("Get all admins error:", error);
        res.status(500).json(
            formatToastResponse('error', 'Failed to load admins')
        );
    }
};

// Create new admin (only for super_admin with limit check)
export const createAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, phone, password, role = "admin" } = req.body;

        // Check if requester is super admin
        if (req.admin?.role !== 'super_admin') {
            return res.status(403).json(
                formatToastResponse('error', 'Only super admin can create new admins')
            );
        }

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json(
                formatToastResponse('error', 'Name, email, and password are required')
            );
        }

        // Check current admin count
        const adminCount = await getActiveAdminCount();
        if (adminCount >= MAX_ADMINS) {
            return res.status(400).json(
                formatToastResponse('error', `Maximum limit of ${MAX_ADMINS} admins reached`)
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
            role: role === 'super_admin' ? 'admin' : role, // Prevent creating another super_admin
            memberSince: new Date(),
            createdBy: req.admin?.adminId
        });

        await admin.save();

        // Count again after creation
        const newAdminCount = await getActiveAdminCount();

        res.status(201).json(
            formatToastResponse('success', 'Admin created successfully', {
                admin: admin.toJSON(),
                adminCount: newAdminCount,
                maxLimit: MAX_ADMINS,
                canAddMore: newAdminCount < MAX_ADMINS
            })
        );
    } catch (error: any) {
        console.error("Admin creation error:", error);

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
            formatToastResponse('error', 'Failed to create admin. Please try again.')
        );
    }
};

// Update admin (only super_admin or self)
export const updateAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role } = req.body;

        // Check permissions
        const isSelf = req.admin?.adminId === id;
        const isSuperAdmin = req.admin?.role === 'super_admin';

        if (!isSelf && !isSuperAdmin) {
            return res.status(403).json(
                formatToastResponse('error', 'Not authorized to update this admin')
            );
        }

        // Find admin
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json(
                formatToastResponse('error', 'Admin not found')
            );
        }

        // Prepare updates
        const updates: any = {};

        if (name) updates.name = name;
        if (phone !== undefined) updates.phone = phone || null;

        // Only super admin can change role and email
        if (isSuperAdmin) {
            if (role) updates.role = role;
            if (email && email !== admin.email) {
                // Check if new email exists
                const existingAdmin = await Admin.findOne({
                    email,
                    _id: { $ne: id }
                });

                if (existingAdmin) {
                    return res.status(400).json(
                        formatToastResponse('error', 'Email already exists')
                    );
                }
                updates.email = email;
            }
        }

        // Update admin
        Object.assign(admin, updates);
        await admin.save();

        res.json(
            formatToastResponse('success', 'Admin updated successfully', {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    phone: admin.phone,
                    memberSince: admin.memberSince,
                    lastLogin: admin.lastLogin,
                    createdAt: admin.createdAt,
                    updatedAt: admin.updatedAt
                }
            })
        );

    } catch (error: any) {
        console.error("Update admin error:", error);

        if (error.code === 11000) {
            return res.status(400).json(
                formatToastResponse('error', 'Email already exists')
            );
        }

        res.status(500).json(
            formatToastResponse('error', 'Failed to update admin')
        );
    }
};

export const resetAdminPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        // Check if requester is super admin
        if (req.admin?.role !== 'super_admin') {
            return res.status(403).json(
                formatToastResponse('error', 'Only super admin can reset passwords')
            );
        }

        // Validation
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json(
                formatToastResponse('error', 'New password must be at least 6 characters')
            );
        }

        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json(
                formatToastResponse('error', 'Admin not found')
            );
        }

        // Update password (will be hashed by pre-save hook)
        admin.password = newPassword;
        await admin.save();

        res.json(
            formatToastResponse('success', 'Password reset successfully')
        );
    } catch (error: any) {
        console.error("Reset password error:", error);
        res.status(500).json(
            formatToastResponse('error', 'Failed to reset password')
        );
    }
};

// Delete admin (only for super_admin, cannot delete self)
export const deleteAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Check if requester is super admin
        if (req.admin?.role !== 'super_admin') {
            return res.status(403).json(
                formatToastResponse('error', 'Only super admin can delete admins')
            );
        }

        // Cannot delete self
        if (req.admin.adminId === id) {
            return res.status(400).json(
                formatToastResponse('error', 'Cannot delete your own account')
            );
        }

        // Check current admin count
        const adminCount = await getActiveAdminCount();
        if (adminCount <= 1) {
            return res.status(400).json(
                formatToastResponse('error', 'Cannot delete the last admin account')
            );
        }

        // Soft delete by setting isActive to false
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json(
                formatToastResponse('error', 'Admin not found')
            );
        }

        admin.isActive = false;
        await admin.save();

        // Get updated count
        const newAdminCount = await getActiveAdminCount();

        res.json(
            formatToastResponse('success', 'Admin deleted successfully', {
                adminCount: newAdminCount,
                canAddMore: newAdminCount < MAX_ADMINS
            })
        );

    } catch (error: any) {
        console.error("Delete admin error:", error);
        res.status(500).json(
            formatToastResponse('error', 'Failed to delete admin')
        );
    }
};

// Get admin stats
export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const adminCount = await Admin.countDocuments({ isActive: true });
        const superAdminCount = await Admin.countDocuments({
            role: 'super_admin',
            isActive: true
        });

        res.json(
            formatToastResponse('success', 'Admin stats loaded successfully', {
                adminCount,
                superAdminCount,
                maxLimit: MAX_ADMINS,
                canAddMore: adminCount < MAX_ADMINS,
                availableSlots: MAX_ADMINS - adminCount
            })
        );
    } catch (error: any) {
        console.error("Get admin stats error:", error);
        res.status(500).json(
            formatToastResponse('error', 'Failed to load admin statistics')
        );
    }
};

// Register Admin (for initial setup only)
export const registerAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, role = "super_admin" } = req.body;

        // Check current admin count (even for initial setup)
        const adminCount = await getActiveAdminCount();
        if (adminCount >= MAX_ADMINS) {
            return res.status(400).json(
                formatToastResponse('error', `Maximum limit of ${MAX_ADMINS} admins reached`)
            );
        }

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
            role, // Allow super_admin for initial setup
            memberSince: new Date(),
        });

        await admin.save();

        // Count again after creation
        const newAdminCount = await getActiveAdminCount();

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
                admin: admin.toJSON(),
                adminCount: newAdminCount,
                maxLimit: MAX_ADMINS
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
        const { name, email, phone } = req.body;

        // Validation
        if (!name || !email) {
            return res.status(400).json(
                formatToastResponse('error', 'Name and email are required')
            );
        }

        // Check if email is being changed
        const currentAdmin = await Admin.findById(req.admin?.adminId);
        if (!currentAdmin) {
            return res.status(404).json(
                formatToastResponse('error', 'Admin not found')
            );
        }

        // If email is being changed, check if it already exists
        if (email !== currentAdmin.email) {
            const existingAdmin = await Admin.findOne({
                email,
                _id: { $ne: req.admin?.adminId }
            });

            if (existingAdmin) {
                return res.status(400).json(
                    formatToastResponse('error', 'Email already exists')
                );
            }
        }

        // Update the admin
        const admin = await Admin.findByIdAndUpdate(
            req.admin?.adminId,
            { name, email, phone: phone || null },
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
                    lastLogin: admin.lastLogin,
                    createdAt: admin.createdAt,
                    updatedAt: admin.updatedAt
                }
            })
        );
    } catch (error: any) {
        console.error("Update profile error:", error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json(
                formatToastResponse('error', `Update failed: ${errors.join(', ')}`)
            );
        }

        if (error.code === 11000) {
            return res.status(400).json(
                formatToastResponse('error', 'Email already exists')
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