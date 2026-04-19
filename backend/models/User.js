const mongoose = require("mongoose");

const pickupZones = [
  "Library",
  "Canteen",
  "Hostel-A",
  "Hostel-B",
  "Hostel-C",
  "Main Gate",
  "Academic Block",
];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hashed
    avatar: { type: String, default: "" }, // URL
    bio: { type: String, default: "" },

    verified: { type: Boolean, default: false },
    verifiedBadge: { type: Boolean, default: false },

    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    responseRate: { type: Number, default: 100 },

    totalLent: { type: Number, default: 0 },
    totalBorrowed: { type: Number, default: 0 },

    pickupZone: {
      type: String,
      enum: pickupZones,
      required: true,
    },
    role: {
  type: String,
  enum: ["user", "admin"],
  default: "user"
},

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("User", UserSchema);