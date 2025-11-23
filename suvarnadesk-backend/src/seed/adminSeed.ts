import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin";

dotenv.config();

async function seedAdmin() {
    await mongoose.connect(process.env.MONGO_URI!);

    const email = "admin@example.com";
    const password = "securepassword";
    const phone = "1234567890";

    const exists = await Admin.findOne({ email });
    if (exists) {
        console.log("Admin already exists.");
    } else {
        const admin = new Admin({ name: "Super Admin", email, password, phone });
        await admin.save();
        console.log("Admin seeded successfully.");
    }

    await mongoose.disconnect();
}

seedAdmin().catch(console.error);
