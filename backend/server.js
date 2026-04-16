const dotenv=require("dotenv") // Load env vars
dotenv.config();

// console.log("👉 ENV:", process.env);

const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path=require("path");

const connectDB = require("./config/dbs.cjs");
const errorHandler = require("./middleware/errorHandler");
const { startCron } = require("./cron/bookingCron");
const { initSocket } = require("./socket/chatSocket");

const authRouter = require("./routes/auth/auth-routes");
const itemsRouter = require("./routes/items/items-routes");
const bookingsRouter = require("./routes/bookings/bookings-routes");
const messagesRouter = require("./routes/messages/messages-routes");
const reviewsRouter = require("./routes/reviews/reviews-routes");
const notificationsRouter = require("./routes/notifications/notifications-routes");
const usersRouter = require("./routes/users/users-routes");
const statsRouter = require("./routes/stats/stats-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const _dirname=path.resolve();
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Connect to MongoDB
connectDB().then(() => {
  startCron();
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});


// CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser clients (Postman, curl)
      if (!origin) return callback(null, true);

      // if not configured, allow all origins (dev convenience)
      if (allowedOrigins.length === 0) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control", // ✅ CORS is case-sensitive, use this
      "Expires",
      "Pragma"
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Health check (test in Postman: GET http://localhost:5000/api)
app.get("/api", (req, res) => {
  res.json({ success: true, message: "API is running", baseUrl: "/api" });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/users", usersRouter);
app.use("/api/stats", statsRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);

app.use("/api/common/feature", commonFeatureRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

// Must be last.
app.use(errorHandler);

// Start server
initSocket(server, allowedOrigins);
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  // console.log("ENV CHECK:", process.env.MONGO_URI);
});
