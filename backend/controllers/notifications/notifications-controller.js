const Notification = require("../../models/Notification");

// GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ notifications });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/notifications/read-all
const readAll = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/notifications/:id/read
const readOne = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

// GET /api/notifications/unread-count
const unreadCount = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const count = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    return res.json({ count });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getNotifications,
  readAll,
  readOne,
  unreadCount,
};

