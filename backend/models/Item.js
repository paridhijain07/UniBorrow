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

const itemCategories = [
  "Electronics",
  "Books",
  "Furniture",
  "Clothing",
  "Stationery",
  "Lab Equipment",
  "Hostel Essentials",
  "Bikes",
];

const itemConditions = ["New", "Like New", "Used", "Heavily Used"];
const listingTypes = ["Rent", "Exchange"];
const itemStatuses = ["available", "rented", "reserved"];

const ItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    category: { type: String, enum: itemCategories, required: true },
    condition: { type: String, enum: itemConditions, required: true },
    listingType: { type: String, enum: listingTypes, default: "Rent" },

    price: { type: Number, required: true }, // per day, 0 if Exchange
    originalPrice: { type: Number, default: 0 },

    images: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length <= 3,
        message: "Max 3 images allowed",
      },
      default: [],
    },

    tags: { type: [String], default: [] },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: { type: String, enum: itemStatuses, default: "available" },

    pickupLocation: { type: String, enum: pickupZones, required: true },

    views: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Item", ItemSchema);

