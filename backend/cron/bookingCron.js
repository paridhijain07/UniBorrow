const cron = require("node-cron");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const Item = require("../models/Item");
const User = require("../models/User");

// Run once every day at midnight (or use '0 * * * *' for testing/every hour)
// We'll use 0 0 * * *
const PENALTY_PER_DAY = 5;

const startCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("[CRON] Running daily booking checks...");

      const now = new Date();
      const todayString = now.toDateString();

      // 1. One-Day Reminders
      // Find bookings that are 'approved' and where endDate is exactly tomorrow.
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const approvedBookings = await Booking.find({ status: "approved" }).populate("item");

      for (const b of approvedBookings) {
        if (!b.endDate) continue;
        
        const endDt = new Date(b.endDate);
        const diffDays = Math.floor((endDt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Reminder (exactly 1 day left)
        if (diffDays === 0) { // e.g. tomorrow - now is ~0.xyz days
          // Check if exactly tomorrow
          if (endDt.toDateString() === tomorrow.toDateString()) {
             await Notification.create({
                user: b.borrower,
                type: "booking_reminder",
                message: `Reminder: Your borrowed item "${b.item?.title}" is due tomorrow!`,
                relatedBooking: b._id,
             });
          }
        }

        // 2. Penalty (overdue)
        // Check if endDate < now (ignoring time) 
        if (endDt.getTime() < new Date(todayString).getTime()) {
          const lastApplied = b.lastPenaltyAppliedDate ? new Date(b.lastPenaltyAppliedDate).toDateString() : null;

          // Prevent charging twice on the same calendar day
          if (lastApplied !== todayString) {
            b.penaltyAmount = (b.penaltyAmount || 0) + PENALTY_PER_DAY;
            b.lastPenaltyAppliedDate = now;
            await b.save();

            // Notify user of penalty
            await Notification.create({
              user: b.borrower,
              type: "penalty_applied",
              message: `Overdue warning: A late penalty of ₹${PENALTY_PER_DAY} has been added for "${b.item?.title}". Please return immediately.`,
              relatedBooking: b._id,
            });
          }
        }
      }

      console.log("[CRON] Daily booking checks completed.");
    } catch (err) {
      console.error("[CRON] Error running jobs:", err);
    }
  });

  console.log("[CRON] Booking checking schedule initialized.");
};

module.exports = { startCron };
