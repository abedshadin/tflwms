// createAdmin.js
const mongoose = require("mongoose");
const User = require("./models/User"); // adjust path if your User model is elsewhere
require("dotenv").config();

// Use same DB as your server
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/warehouse_db";

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 👇 Change username/password if you want
    const username = "admin";
    const password = "admin123";

    let user = await User.findOne({ username });

    if (user) {
      console.log("Admin already exists:", user.username);
    } else {
      user = new User({ username, role: "admin" });
      await user.setPassword(password); // uses your setPassword method
      await user.save();
      console.log("Admin user created.");
    }

    console.log("Login with:");
    console.log("  username:", username);
    console.log("  password:", password);
    console.log("  role:    ", user.role);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

main();
