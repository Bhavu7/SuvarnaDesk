const mongoose = require("mongoose");
require("dotenv").config();

async function simpleCheck() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Direct MongoDB query - no model imports needed
    const db = mongoose.connection.db;
    const admins = await db.collection("admins").find({}).toArray();

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
        console.log(
          `   Password Hash: ${admin.password ? "Exists" : "Missing"}`
        );
      });
    }

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

simpleCheck();
