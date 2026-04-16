const { Server } = require("socket.io");

let io;

// userId -> socketId map
const onlineUsers = new Map();

const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // 1. User joins / Registers presence
    socket.on("register", (userId) => {
      onlineUsers.set(userId, socket.id);
      
      // Broadcast online status to others
      io.emit("user_online", userId);
    });

    // Send the current list of online users to whoever requests
    socket.on("get_online_users", (callback) => {
      const onlineIds = Array.from(onlineUsers.keys());
      if(callback) callback(onlineIds);
    });

    // 2. Typing indicator
    socket.on("typing", ({ senderId, receiverId, isTyping }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", { senderId, isTyping });
      }
    });

    // 3. Private message real-time delivery
    socket.on("send_private_message", (message) => {
      const receiverSocketId = onlineUsers.get(message.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_private_message", message);
      }
    });

    // 4. Disconnect
    socket.on("disconnect", () => {
      let disconnectedUserId = null;
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        io.emit("user_offline", disconnectedUserId);
      }
    });
  });

  return io;
};

const getIo = () => io;
const getOnlineUsers = () => onlineUsers;

module.exports = { initSocket, getIo, getOnlineUsers };
