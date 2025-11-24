const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function simpleReset() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;

    // Clear existing admins
    await db.collection("admins").deleteMany({});
    console.log("🗑️  Cleared existing admin users");

    // Create new admin with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const newAdmin = {
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
      phone: "1234567890",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("admins").insertOne(newAdmin);
    console.log("✅ New admin created successfully!");
    console.log("\n📧 Login Credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
    console.log("\n💡 Use these credentials to test login");

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

simpleReset();
