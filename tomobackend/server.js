const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
require("dotenv").config(); // Load environment variables

const connectDB = require("./config/db");
const cleanupOldResolvedTickets = require("./utils/cleanupResolvedTickets");
const { getUploadsRoot } = require("./utils/uploadsPath");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});
app.set("io", io);

io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token;
  const isVendor = socket.handshake.auth?.isVendor;

  if (!token) {
    socket.disconnect(true);
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const actorId = decoded.id || decoded._id;

    if (!actorId) {
      socket.disconnect(true);
      return;
    }

    if (isVendor) {
      socket.join(`vendor:${actorId}`);
      console.log(`🔌 Vendor ${actorId} connected to socket`);
    } else {
      socket.join(`user:${actorId}`);
      console.log(`🔌 User ${actorId} connected to socket`);
    }
  } catch {
    socket.disconnect(true);
    return;
  }

  socket.on("disconnect", () => {
    console.log(`⚡ Socket disconnected: ${socket.id}`);
  });
});

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Connect MongoDB
connectDB();

// Serve uploads folder for images
app.use('/uploads', express.static(getUploadsRoot()));

// ✅ Clean Route Structure
const userAuthRoutes = require("./routes/userAuthRoutes");
app.use("/api", userAuthRoutes);
// Vendor Authentication
const vendorAuthRoutes = require('./routes/vendorAuthRoutes');
app.use("/api/vendor-auth", vendorAuthRoutes);

// Vendor Profile & CRUD
const vendorRoutes = require("./routes/vendorRoutes");
app.use("/api/vendors", vendorRoutes);

// Vendor Menu Management
const vendorMenuRoutes = require('./routes/vendorMenuRoutes');
app.use("/api/vendor-menu", vendorMenuRoutes);  // 🔥 Cleaned

// Vendor Approval & Pending Vendors
const vendorApprovalRoutes = require('./routes/vendorApprovalRoutes');
app.use('/api/vendor-approvals', vendorApprovalRoutes);

const pendingVendorsRoutes = require("./routes/pendingVendors");
app.use("/api/pending-vendors", pendingVendorsRoutes);

// Restaurant Public APIs
const restaurantRoutes = require('./routes/restaurantRoutes');
app.use("/api/restaurants", restaurantRoutes);

// File Upload (Proof, Logo, etc.)
const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

// Announcements & Banners
const announcementRoutes = require("./routes/announcementRoutes");
app.use("/api/announcements", announcementRoutes);

const bannerRoutes = require("./routes/bannerRoutes");
app.use("/api/banners", bannerRoutes);

// Orders & Analytics
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// Coupons
const couponRoutes = require('./routes/couponRoutes');
app.use('/api/coupons', couponRoutes);

// Location Proxy
const locationRoutes = require('./routes/locationRoutes');
app.use('/api/location', locationRoutes);

// Support Tickets
const supportRoutes = require("./routes/supportRoutes");
app.use("/api/support", supportRoutes);

// Admin & Employee Authentication
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const adminAuthRoutes = require("./routes/adminAuthRoutes");
app.use("/api/admin-auth", adminAuthRoutes);

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// 🕒 Scheduled Tasks (like cleanup)
cron.schedule("0 3 * * *", () => {
  console.log("🔄 Running daily cleanup at 3:00 AM...");
  cleanupOldResolvedTickets();
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
