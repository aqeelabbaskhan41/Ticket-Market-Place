// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const DBurl = process.env.MONGO_CONN;

    mongoose.connection.on('connecting', () => console.log('⏳ MongoDB connecting...'));
    mongoose.connection.on('connected', () => console.log('✅ MongoDB connected event'));
    mongoose.connection.on('disconnected', () => console.log('❌ MongoDB disconnected event'));
    mongoose.connection.on('error', (err) => console.log('❌ MongoDB Connection Error Event:', err));

    await mongoose.connect(DBurl, {
      family: 4, // Force IPv4
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Atlas Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
