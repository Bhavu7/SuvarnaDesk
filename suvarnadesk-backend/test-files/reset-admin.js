const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    // Correct path
    const Admin = require("../src/models/Admin").default;

    // Delete existing admin
    await Admin.deleteMany({});
    console.log("🗑️  Cleared existing admin users");

    // Create new admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const admin = new Admin({
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
      phone: "1234567890",
      role: "admin",
    });

    await admin.save();
    console.log("✅ New admin created successfully!");
    console.log("\n📧 Login Credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
    console.log("\n💡 Use these credentials in your test script");

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
  }
}

resetAdmin();
