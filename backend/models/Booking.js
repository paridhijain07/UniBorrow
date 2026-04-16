const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    totalDays: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "returned"],
      default: "pending",
    },

    reviewLeft: { type: Boolean, default: false },

    penaltyAmount: { type: Number, default: 0 },
    lastPenaltyAppliedDate: { type: Date },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Booking", BookingSchema);

