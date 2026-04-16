const mongoose = require("mongoose");

const Message = require("../../models/Message");
const Notification = require("../../models/Notification");
const Item = require("../../models/Item");
const User = require("../../models/User");
const { getIo, getOnlineUsers } = require("../../socket/chatSocket");

const createNotification = async ({
  userId,
  type,
  message,
  relatedItem,
}) => {
  if (!userId) return;
  await Notification.create({
    user: userId,
    type,
    message,
    relatedItem,
  });
};

// POST /api/messages
const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user?.id;
    if (!senderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { receiverId, text, itemId } = req.body;

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      item: itemId || undefined,
      text,
      read: false,
    });

    // Notification for receiver
    const sender = await User.findById(senderId).select("name");
    let itemTitle = "";
    if (itemId) {
      const item = await Item.findById(itemId).select("title");
      itemTitle = item?.title ? ` about "${item.title}"` : "";
    }

    const io = getIo();
    const onlineUsers = getOnlineUsers();
    if (io && onlineUsers) {
      const receiverSocketId = onlineUsers.get(String(receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_private_message", message);
      }
    }

    await createNotification({
      userId: receiverId,
      type: "new_message",
      message: `${sender?.name || "Someone"} sent you a message${itemTitle}.`,
      relatedItem: itemId || undefined,
    });

    return res.status(201).json({ message });
  } catch (err) {
    return next(err);
  }
};

// GET /api/messages/conversations
const getConversations = async (req, res, next) => {
  try {
    const meId = new mongoose.Types.ObjectId(req.user?.id);

    if (!meId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: meId }, { receiver: meId }],
        },
      },
      {
        $addFields: {
    otherUser: {
      $cond: [
        { $eq: ["$sender", meId] },
        "$receiver",
        "$sender"
      ]
    }
  }
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", meId] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "otherUser",
        },
      },
      { $unwind: "$otherUser" },
      {
        $project: {
          _id: 0,
          otherUser: {
            _id: "$otherUser._id",
            name: "$otherUser.name",
            avatar: "$otherUser.avatar",
            verifiedBadge: "$otherUser.verifiedBadge",
          },
          lastMessage: {
            _id: "$lastMessage._id",
            sender: "$lastMessage.sender",
            receiver: "$lastMessage.receiver",
            item: "$lastMessage.item",
            text: "$lastMessage.text",
            read: "$lastMessage.read",
            timestamp: "$lastMessage.timestamp",
          },
          unreadCount: 1,
        },
      },
      { $sort: { "lastMessage.timestamp": -1 } },
    ]);

    return res.json({ conversations });
  } catch (err) {
    return next(err);
  }
};

// GET /api/messages/:userId
const getThread = async (req, res, next) => {
  try {
    const meId = req.user?.id;
    const { userId } = req.params;

    if (!meId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const messages = await Message.find({
      $or: [
        { sender: meId, receiver: userId },
        { sender: userId, receiver: meId },
      ],
    }).sort({ timestamp: 1 });

    // Mark messages from the other user as read.
    await Message.updateMany(
      { sender: userId, receiver: meId, read: false },
      { $set: { read: true } }
    );

    const otherUser = await User.findById(userId).select(
      "name avatar verifiedBadge"
    );

    return res.json({ otherUser, messages });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getThread,
};

