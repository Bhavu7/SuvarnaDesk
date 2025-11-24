const mongoose = require("mongoose");
require("dotenv").config();

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    // Correct path - from test-files to src/models
    const Admin = require("../src/models/Admin").default;

    const admins = await Admin.find();
    console.log("📋 Admin users in database:");

    if (admins.length === 0) {
      console.log("❌ No admin users found!");
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin User:`);
        console.log(`   ID: ${admin._id}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Phone: ${admin.phone}`);
        console.log(`   Role: ${admin.role}`);
      });
    }

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAdmin();
