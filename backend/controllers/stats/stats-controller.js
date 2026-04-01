const Item = require("../../models/Item");
const Booking = require("../../models/Booking");
const User = require("../../models/User");

// GET /api/stats/home
const getHomeStats = async (req, res, next) => {
  try {
    const itemsListed = await Item.countDocuments();
    const activeBorrows = await Booking.countDocuments({ status: "approved" });

    const totals = await Booking.aggregate([
      { $match: { status: "returned" } },
      { $group: { _id: null, sum: { $sum: "$totalCost" } } },
    ]);

    const totalEarned = totals[0]?.sum || 0;
    const totalSpent = totals[0]?.sum || 0;

    const verifiedUsers = await User.countDocuments({ verified: true });

    return res.json({
      itemsListed,
      activeBorrows,
      totalEarned,
      totalSpent,
      verifiedUsers,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getHomeStats };

