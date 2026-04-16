const mongoose = require("mongoose");

const Booking = require("../../models/Booking");
const Item = require("../../models/Item");
const Notification = require("../../models/Notification");
const User = require("../../models/User");

const normalizeDate = (d) => {
  const dt = new Date(d);
  return new Date(dt.toDateString()); // midnight local time
};

const calcTotalDaysInclusive = (startDate, endDate) => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const dayMs = 1000 * 60 * 60 * 24;
  const diff = Math.floor((end.getTime() - start.getTime()) / dayMs);
  return Math.max(diff + 1, 1);
};

const createNotification = async ({
  userId,
  type,
  message,
  relatedItem,
  relatedBooking,
}) => {
  if (!userId) return;
  await Notification.create({
    user: userId,
    type,
    message,
    relatedItem,
    relatedBooking,
  });
};

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const borrowerId = req.user?.id;
    if (!borrowerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { itemId, startDate, endDate } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Prevent overlaps with pending/approved bookings.
    const overlap = await Booking.findOne({
      item: itemId,
      status: { $in: ["pending", "approved"] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: "Dates overlap with an existing booking",
      });
    }

    const totalDays = calcTotalDaysInclusive(startDate, endDate);
    const totalCost =
      item.listingType === "Rent" ? item.price * totalDays : 0;

    const booking = await Booking.create({
      item: itemId,
      borrower: borrowerId,
      owner: item.owner,
      startDate,
      endDate,
      totalDays,
      totalCost,
      status: "pending",
      reviewLeft: false,
    });

    const borrower = await User.findById(borrowerId);
    await createNotification({
      userId: item.owner,
      type: "booking_requested",
      message: `${borrower?.name || "A user"} requested to borrow "${item.title}"`,
      relatedItem: item._id,
      relatedBooking: booking._id,
    });

    return res.status(201).json({ booking });
  } catch (err) {
    return next(err);
  }
};

// GET /api/bookings/my-requests
const getMyRequests = async (req, res, next) => {
  try {
    const borrowerId = req.user?.id;
    if (!borrowerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({ borrower: borrowerId })
      .populate("item", "title images listingType category pickupLocation")
      .populate("owner", "name avatar")
      .sort({ createdAt: -1 });

    return res.json({ bookings });
  } catch (err) {
    return next(err);
  }
};

// GET /api/bookings/received
const getReceived = async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({ owner: ownerId })
      .populate("item", "title images listingType category pickupLocation")
      .populate("borrower", "name avatar")
      .sort({ createdAt: -1 });

    return res.json({ bookings });
  } catch (err) {
    return next(err);
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const userId = req.user?.id;
    const booking = await Booking.findById(id)
      .populate("item", "title images listingType category pickupLocation")
      .populate("borrower", "name avatar")
      .populate("owner", "name avatar");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (
      String(booking.borrower._id) !== String(userId) &&
      String(booking.owner._id) !== String(userId)
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ booking });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/bookings/:id/approve
const approveBooking = async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("item");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (String(booking.owner) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    booking.status = "approved";
    await booking.save();


    const borrower = await User.findById(booking.borrower);
    await createNotification({
      userId: booking.borrower,
      type: "booking_approved",
      message: `Your request to borrow "${booking.item.title}" was approved.`,
      relatedItem: booking.item._id,
      relatedBooking: booking._id,
    });

    return res.json({ booking, borrower });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/bookings/:id/reject
const rejectBooking = async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("item");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (String(booking.owner) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    booking.status = "rejected";
    await booking.save();


    await createNotification({
      userId: booking.borrower,
      type: "booking_rejected",
      message: `Your request to borrow "${booking.item.title}" was rejected.`,
      relatedItem: booking.item._id,
      relatedBooking: booking._id,
    });

    return res.json({ booking });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/bookings/:id/return
const returnBooking = async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("item");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (String(booking.owner) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    booking.status = "returned";
    booking.reviewLeft = false;
    await booking.save();


    await User.findByIdAndUpdate(booking.owner, { $inc: { totalLent: 1 } });
    await User.findByIdAndUpdate(booking.borrower, {
      $inc: { totalBorrowed: 1 },
    });

    await createNotification({
      userId: booking.borrower,
      type: "booking_returned",
      message: `The item "${booking.item.title}" was returned. You can leave a review.`,
      relatedItem: booking.item._id,
      relatedBooking: booking._id,
    });

    return res.json({ booking });
  } catch (err) {
    return next(err);
  }
};
// const getItemBookings = async (req, res) => {
//   try {
//     const { itemId } = req.params;

//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // normalize

//     const bookings = await Booking.find({
//       item: itemId,
//       status: { $in: ["pending", "approved"] }, // ✅ only active
//       endDate: { $gte: today }, // ✅ only current/future
//     }).select("startDate endDate status");

//     res.json({ bookings });
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching bookings" });
//   }
// };

const getItemBookings = async (req, res) => {
  try {
    const { itemId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      item: new mongoose.Types.ObjectId(itemId), // 🔥 IMPORTANT
      status: { $in: ["pending", "approved"] },
      endDate: { $gte: today },
    }).select("startDate endDate status");

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};
module.exports = {
  createBooking,
  getMyRequests,
  getReceived,
  getBookingById,
  approveBooking,
  rejectBooking,
  returnBooking,
  getItemBookings,
};

