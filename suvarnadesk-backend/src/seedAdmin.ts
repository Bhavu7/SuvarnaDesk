import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function seedAdmin() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Dynamically import models (to avoid path issues)
        const { default: Admin } = await import("./models/Admin");
        const { hashPassword } = await import("./utils/hashPassword");

        const adminData = {
            name: "Super Admin",
            email: "admin@example.com",
            password: "securepassword",
            phone: "1234567890",
            role: "admin"
        };

        const exists = await Admin.findOne({ email: adminData.email });
        if (exists) {
            console.log("Admin already exists.");
        } else {
            const hashedPassword = await hashPassword(adminData.password);
            const admin = new Admin({
                ...adminData,
                password: hashedPassword
            });
            await admin.save();
            console.log("Admin seeded successfully:");
            console.log(`Email: ${adminData.email}`);
            console.log(`Password: ${adminData.password}`);
        }

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seedAdmin();