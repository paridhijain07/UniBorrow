const mongoose = require("mongoose");

const User = require("../../models/User");
const Item = require("../../models/Item");
const Review = require("../../models/Review");

const getPublicUser = (userDoc) => {
  if (!userDoc) return null;
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    avatar: userDoc.avatar,
    bio: userDoc.bio,
    verified: userDoc.verified,
    verifiedBadge: userDoc.verifiedBadge,
    rating: userDoc.rating,
    totalRatings: userDoc.totalRatings,
    responseRate: userDoc.responseRate,
    totalLent: userDoc.totalLent,
    totalBorrowed: userDoc.totalBorrowed,
    pickupZone: userDoc.pickupZone,
    createdAt: userDoc.createdAt,
  };
};

// GET /api/users/:id
const getUserPublic = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const user = await User.findById(id).select(
      "name email avatar bio verified verifiedBadge rating totalRatings responseRate totalLent totalBorrowed pickupZone createdAt"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const items = await Item.find({ owner: id }).sort({ createdAt: -1 });

    const reviews = await Review.find({ targetUser: id })
      .populate("reviewer", "name avatar verifiedBadge")
      .populate("booking", "startDate endDate")
      .sort({ createdAt: -1 });

    return res.json({ user: getPublicUser(user), items, reviews });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/users/profile
const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, bio, avatar, pickupZone } = req.body;

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        ...(name !== undefined ? { name } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(pickupZone !== undefined ? { pickupZone } : {}),
      },
      { new: true }
    ).select(
      "name email avatar bio verified verifiedBadge rating totalRatings responseRate totalLent totalBorrowed pickupZone createdAt"
    );

    return res.json({ user: getPublicUser(updated) });
  } catch (err) {
    return next(err);
  }
};

// GET /api/users/:id/reviews
const getReviewsReceived = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ targetUser: id })
      .populate("reviewer", "name avatar verifiedBadge")
      .populate("item", "title images")
      .populate("booking", "startDate endDate status")
      .sort({ createdAt: -1 });

    return res.json({ reviews });
  } catch (err) {
    return next(err);
  }
};

// GET /api/users/count
const getUserCount = async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    return res.json({ count });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getUserPublic,
  updateMyProfile,
  getReviewsReceived,
  getUserCount,
};

