// create-admin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Import the User model
const User = require('./models/User'); // Adjust path if needed

const createAdmin = async () => {
  try {
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
      return;
    }

    // Create new admin WITH admin role
    const admin = await User.create({
      email: "admin@example.com",
      password: "123123", // Will be hashed automatically
      role: "admin", // MUST be 'admin' for admin access
      status: "approved",
      activeRole: "buyer", // Required field - set to 'buyer' since admin can't switch roles
      profile: {
        fullName: "Super Admin",
        phone: "+1234567890",
      },
    });

    console.log("✅ Admin created successfully!");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Password: 123123");

  } catch (error) {
    console.error("Error creating admin:", error.message);
  }
};

module.exports = createAdmin;