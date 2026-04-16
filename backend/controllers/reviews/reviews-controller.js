const mongoose = require("mongoose");

const Booking = require("../../models/Booking");
const Item = require("../../models/Item");
const Review = require("../../models/Review");
const Notification = require("../../models/Notification");
const User = require("../../models/User");

const updateUserRatingFromReviews = async (targetUserId) => {
  const stats = await Review.aggregate([
    { $match: { targetUser: new mongoose.Types.ObjectId(targetUserId) } },
    {
      $group: {
        _id: null,
        avgOverall: { $avg: "$overallRating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const { avgOverall = 0, totalRatings = 0 } = stats[0] || {};
  await User.findByIdAndUpdate(targetUserId, {
    rating: avgOverall,
    totalRatings,
  });
};

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const reviewerId = req.user?.id;
    if (!reviewerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      bookingId,
      overallRating,
      priceRating,
      qualityRating,
      conditionRating,
      comment,
    } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "returned") {
      return res.status(400).json({
        success: false,
        message: "Review is only allowed after return",
      });
    }

    if (booking.reviewLeft !== false) {
      return res.status(400).json({
        success: false,
        message: "Review already submitted for this booking",
      });
    }

    const item = await Item.findById(booking.item);

    // MVP assumption from interviews: borrower reviews the owner (lender).
    const reviewer = booking.borrower;
    const targetUser = booking.owner;

    if (String(reviewer) !== String(reviewerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const review = await Review.create({
      reviewer,
      targetUser,
      item: booking.item,
      booking: booking._id,
      overallRating,
      priceRating: priceRating || 0,
      qualityRating: qualityRating || 0,
      conditionRating: conditionRating || 0,
      comment: comment || "",
    });

    booking.reviewLeft = true;
    await booking.save();

    await updateUserRatingFromReviews(targetUser);

    const reviewerUser = await User.findById(reviewerId).select("name");
    await Notification.create({
      user: targetUser,
      type: "review_received",
      message: `${reviewerUser?.name || "A user"} left a review for your item "${item?.title || ""}".`,
      relatedItem: item?._id,
      relatedBooking: booking._id,
    });

    return res.status(201).json({ review });
  } catch (err) {
    return next(err);
  }
};

// GET /api/reviews/item/:itemId
const getReviewsForItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const reviews = await Review.find({ item: itemId })
      .populate("reviewer", "name avatar verifiedBadge")
      .sort({ createdAt: -1 });

    return res.json({ reviews });
  } catch (err) {
    return next(err);
  }
};

// GET /api/reviews/user/:userId
const getReviewsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ targetUser: userId })
      .populate("reviewer", "name avatar verifiedBadge")
      .populate("item", "title images")
      .sort({ createdAt: -1 });

    return res.json({ reviews });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createReview,
  getReviewsForItem,
  getReviewsForUser,
};

