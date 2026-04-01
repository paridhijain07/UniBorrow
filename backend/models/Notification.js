const mongoose = require("mongoose");

const notificationTypes = [
  "booking_requested",
  "booking_approved",
  "booking_rejected",
  "booking_returned",
  "new_message",
  "review_received",
];

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: notificationTypes, required: true },
    message: { type: String, required: true },

    relatedItem: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Notification", NotificationSchema);

