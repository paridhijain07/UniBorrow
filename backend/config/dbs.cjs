const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing MongoDB connection string.");
  }

  await mongoose.connect(mongoUri);
  console.log("✅ MongoDB connected");
};

module.exports = connectDB;