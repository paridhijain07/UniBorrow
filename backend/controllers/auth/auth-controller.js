const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");

const publicUserShape = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  verified: user.verified,
  verifiedBadge: user.verifiedBadge,
  rating: user.rating,
  totalRatings: user.totalRatings,
  responseRate: user.responseRate,
  totalLent: user.totalLent,
  totalBorrowed: user.totalBorrowed,
  pickupZone: user.pickupZone,
  createdAt: user.createdAt,
});

// POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, pickupZone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: passwordHash,
      pickupZone,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    return res.status(201).json({
      token,
      user: publicUserShape(user),
    });
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    return res.status(200).json({
      token,
      user: publicUserShape(user),
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/auth/me (Protected)
const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: publicUserShape(user),
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { registerUser, loginUser, getMe };