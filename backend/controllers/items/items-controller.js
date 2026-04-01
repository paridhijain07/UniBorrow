const mongoose = require("mongoose");

const Item = require("../../models/Item");
const Review = require("../../models/Review");
const Booking = require("../../models/Booking");
const User = require("../../models/User");

const parseCsv = (value) => {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const toNumber = (value) => {
  if (value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

// GET /api/items
const getItems = async (req, res, next) => {
  try {
    const {
      search,
      category,
      condition,
      listingType,
      minPrice,
      maxPrice,
      status,
      pickupLocation,
      sort,
      page = "1",
      limit = "12",
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const filters = {};

    // Default to available items for the browse experience.
    filters.status = status || "available";

    if (pickupLocation) filters.pickupLocation = pickupLocation;
    if (listingType) filters.listingType = listingType;

    const categories = parseCsv(category);
    if (categories.length) filters.category = { $in: categories };

    const conditions = parseCsv(condition);
    if (conditions.length) filters.condition = { $in: conditions };

    const min = toNumber(minPrice);
    const max = toNumber(maxPrice);
    if (min !== null || max !== null) {
      filters.price = {};
      if (min !== null) filters.price.$gte = min;
      if (max !== null) filters.price.$lte = max;
    }

    if (search && String(search).trim()) {
      const rx = new RegExp(String(search).trim(), "i");
      filters.$or = [{ title: rx }, { description: rx }, { tags: rx }];
    }

    const total = await Item.countDocuments(filters);
    const pages = Math.ceil(total / limitNum) || 1;

    if (sort === "top_rated") {
      // Sort by average overallRating across all reviews for the item.
      const items = await Item.aggregate([
        { $match: filters },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "item",
            as: "reviews",
          },
        },
        {
          $addFields: {
            avgOverall: {
              $cond: [
                { $gt: [{ $size: "$reviews" }, 0] },
                { $avg: "$reviews.overallRating" },
                0,
              ],
            },
            reviewsCount: { $size: "$reviews" },
          },
        },
        { $sort: { avgOverall: -1, reviewsCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
      ]);

      return res.json({ items, total, page: pageNum, pages });
    }

    const query = Item.find(filters);

    if (sort === "price_asc") query.sort({ price: 1, createdAt: -1 });
    else query.sort({ createdAt: -1 }); // newest

    const items = await query.skip(skip).limit(limitNum);

    return res.json({ items, total, page: pageNum, pages });
  } catch (err) {
    return next(err);
  }
};

// GET /api/items/user/my-listings
const getMyListings = async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const items = await Item.find({ owner: ownerId }).sort({ createdAt: -1 });
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
};

// GET /api/items/:id
const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const exists = mongoose.Types.ObjectId.isValid(id);
    if (!exists) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const item = await Item.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const owner = await User.findById(item.owner).select(
      "name avatar verified verifiedBadge rating totalRatings responseRate totalLent pickupZone createdAt"
    );

    const reviews = await Review.find({ item: item._id })
      .populate("reviewer", "name avatar verified verifiedBadge")
      .sort({ createdAt: -1 });

    const approvedBookings = await Booking.find({
      item: item._id,
      status: "approved",
    }).select("startDate endDate");

    return res.json({ item, owner, reviews, approvedBookings });
  } catch (err) {
    return next(err);
  }
};

// POST /api/items
const createItem = async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const payload = { ...req.body, owner: ownerId };
    const item = await Item.create(payload);

    return res.status(201).json({ item });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/items/:id
const updateItem = async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    if (String(item.owner) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Full update: schema-level validation will enforce enums.
    Object.assign(item, req.body);
    const updated = await item.save();

    return res.json({ item: updated });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/items/:id
const deleteItem = async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    if (String(item.owner) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await Item.deleteOne({ _id: id });
    return res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getItems,
  getMyListings,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};

