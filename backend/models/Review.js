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

const ReviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },

    overallRating: { type: Number, required: true, min: 1, max: 5 },
    priceRating: { type: Number, min: 1, max: 5, default: 0 },
    qualityRating: { type: Number, min: 1, max: 5, default: 0 },
    conditionRating: { type: Number, min: 1, max: 5, default: 0 },

    comment: { type: String, default: "" },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Review", ReviewSchema);