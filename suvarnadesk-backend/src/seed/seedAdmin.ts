// seed/seedAdmin.ts - Update existing script
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

const MAX_ADMINS = 4;

async function seedAdmin() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Dynamically import models
        const { default: Admin } = await import("../models/Admin");
        const { hashPassword } = await import("../utils/hashPassword");

        // Check current admin count
        const adminCount = await Admin.countDocuments({ isActive: true });
        console.log(`Current admin count: ${adminCount}/${MAX_ADMINS}`);

        if (adminCount >= MAX_ADMINS) {
            console.log(`Maximum limit of ${MAX_ADMINS} admins reached. Cannot create more.`);
            console.log("Existing admins:");
            const existingAdmins = await Admin.find({ isActive: true }).select('email role');
            existingAdmins.forEach(admin => {
                console.log(`- ${admin.email} (${admin.role})`);
            });

            await mongoose.disconnect();
            console.log("Disconnected from MongoDB");
            process.exit(0);
        }

        const adminData = {
            name: "Super Admin",
            email: "superadmin@suvarnadesk.com",
            password: "Admin@123",
            phone: "1234567890",
            role: "super_admin"
        };

        const exists = await Admin.findOne({ email: adminData.email, isActive: true });
        if (exists) {
            console.log("Super Admin already exists.");
            console.log(`Email: ${adminData.email}`);
            console.log(`Role: ${exists.role}`);
        } else {
            const hashedPassword = await hashPassword(adminData.password);
            const admin = new Admin({
                ...adminData,
                password: hashedPassword,
                isActive: true
            });
            await admin.save();
            console.log("Super Admin seeded successfully:");
            console.log(`Email: ${adminData.email}`);
            console.log(`Password: ${adminData.password}`);
            console.log(`Role: ${adminData.role}`);
        }

        // List all active admins
        const allAdmins = await Admin.find({ isActive: true }).select('email role');
        console.log(`\nTotal active admins: ${allAdmins.length}/${MAX_ADMINS}`);
        allAdmins.forEach(admin => {
            console.log(`- ${admin.email} (${admin.role})`);
        });

        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
        console.log("\nLogin Credentials:");
        console.log("Email: superadmin@suvarnadesk.com");
        console.log("Password: Admin@123");
        console.log("\nNote: Maximum 4 admins allowed. Use Super Admin to create additional admins.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seedAdmin();