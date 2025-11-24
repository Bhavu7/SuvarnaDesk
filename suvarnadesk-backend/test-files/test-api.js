const axios = require("axios");

const BASE_URL = "http://localhost:4000/api";

async function testAPI() {
  try {
    console.log("🚀 Starting API tests...\n");

    // 1. Test Login - Use the new credentials
    console.log("1. Testing admin login...");
    const loginRes = await axios.post(`${BASE_URL}/admin/login`, {
      email: "admin@example.com",
      password: "admin123", // Use the password from reset script
    });
    const token = loginRes.data.token;
    console.log("✅ Login successful");
    console.log(`   Token received: ${token.substring(0, 20)}...\n`);

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test Get Profile
    console.log("2. Testing get admin profile...");
    const profileRes = await axios.get(`${BASE_URL}/admin/profile`, {
      headers,
    });
    console.log("✅ Profile retrieved");
    console.log(
      `   Admin: ${profileRes.data.name} (${profileRes.data.email})\n`
    );

    // 3. Test Shop Settings
    console.log("3. Testing shop settings...");
    const settingsRes = await axios.put(
      `${BASE_URL}/shop-settings`,
      {
        shopName: "My Jewelry Shop",
        address: "123 Main Street, Mumbai, Maharashtra",
        phone: "+91 9876543210",
        gstNumber: "GSTIN123456789",
        logoUrl: "",
      },
      { headers }
    );
    console.log("✅ Shop settings updated");
    console.log(`   Shop: ${settingsRes.data.shopName}\n`);

    // 4. Test Customer Creation
    console.log("4. Testing customer creation...");
    const customerRes = await axios.post(
      `${BASE_URL}/customers`,
      {
        name: "Test Customer",
        email: "test@example.com",
        phone: "1234567890",
        address: "Test Address",
      },
      { headers }
    );
    console.log("✅ Customer created");
    console.log(`   Customer: ${customerRes.data.name}\n`);

    // 5. Test Get Customers
    console.log("5. Testing get customers...");
    const customersRes = await axios.get(`${BASE_URL}/customers`, { headers });
    console.log("✅ Customers retrieved");
    console.log(`   Total customers: ${customersRes.data.length}\n`);

    console.log("🎉 All tests passed! Your API is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:");
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

// Run the tests
testAPI();
