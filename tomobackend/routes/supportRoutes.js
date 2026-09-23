const express = require("express");
const router = express.Router();
const SupportMessage = require("../models/SupportMessage");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");

const verifyVendor = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.vendorId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
// POST /api/support - create a new support message
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, orderId, message } = req.body;

    let vendorId = null;
    if (orderId && orderId !== "No order ID") {
      try {
        const order = await Order.findById(orderId);
        if (order) {
          vendorId = order.vendorId;
        }
      } catch (err) {
        console.error("Invalid order ID for support ticket");
      }
    }

    const newMessage = new SupportMessage({
      name,
      email,
      phone: phone || "",
      orderId: orderId || "No order ID",
      vendorId,
      message,
    });

    await newMessage.save();
    
    // Emit socket event for vendor
    const io = req.app.get('io');
    if (io && vendorId) {
      io.to(`vendor:${vendorId}`).emit('new-complaint', newMessage);
    }

    console.log("✅ New support ticket saved:", newMessage);
    res.status(201).json({
      message: "Support message submitted successfully.",
      ticket: newMessage,
    });
  } catch (err) {
    console.error("Error creating support ticket:", err);
    res.status(500).json({ error: "Failed to submit support message." });
  }
});

// POST /api/support/vendor - create a new support message from a vendor
router.post("/vendor", verifyVendor, async (req, res) => {
  try {
    const { name, email, phone, issueType, message } = req.body;
    const vendorId = req.vendorId;

    const newMessage = new SupportMessage({
      name,
      email,
      phone: phone || "",
      orderId: "No order ID", // Vendors typically raise general account/system issues here
      vendorId,
      senderType: "vendor",
      issueType: issueType || "General",
      message,
    });

    await newMessage.save();

    // Emit socket event so CC portal or Vendor portal gets real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`vendor:${vendorId}`).emit('new-complaint', newMessage);
      io.emit('new-complaint', newMessage); // CC portal might listen to this
    }

    console.log("✅ New vendor support ticket saved:", newMessage);
    res.status(201).json({
      message: "Support ticket submitted successfully.",
      ticket: newMessage,
    });
  } catch (err) {
    console.error("Error creating vendor support ticket:", err);
    res.status(500).json({ error: "Failed to submit support ticket." });
  }
});

// GET /api/support - get all support messages
router.get("/", async (req, res) => {
  try {
    const messages = await SupportMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve support messages." });
  }
});

// GET /api/support/vendor/list - get support messages for a vendor
router.get("/vendor/list", verifyVendor, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { vendorId: req.vendorId };
    
    // If type is 'vendor', return tickets the vendor raised to CC
    // Otherwise, default to 'customer' (complaints from customers)
    if (type === 'vendor') {
      filter.senderType = 'vendor';
    } else {
      filter.senderType = 'customer';
    }

    const messages = await SupportMessage.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve vendor complaints/tickets." });
  }
});

// GET /api/support/summary - dashboard stats
router.get("/summary", async (req, res) => {
  try {
    const total = await SupportMessage.countDocuments();
    const resolved = await SupportMessage.countDocuments({ status: "resolved" });
    const pending = await SupportMessage.countDocuments({ status: "pending" });
    const raised = await SupportMessage.countDocuments({ status: "raised" });

    res.json({ total, resolved, pending, raised });
  } catch (err) {
    res.status(500).json({ error: "Failed to get summary data" });
  }
});

// GET /api/support/status - get customer ticket status by email/ticketId
router.get("/status", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim();
    const ticketId = String(req.query.ticketId || "").trim();

    if (!email && !ticketId) {
      return res.status(400).json({ error: "Provide email or ticketId" });
    }

    const filter = {};
    if (ticketId) filter._id = ticketId;
    if (email) filter.email = email;

    const ticket = await SupportMessage.findOne(filter).sort({ createdAt: -1 });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve ticket status" });
  }
});

// PUT /api/support/:id - update ticket status and send email
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const updateFields = { status };
    if (status === "resolved") {
      updateFields.resolvedAt = new Date(); // ✅ Save resolution time
    }

    const updated = await SupportMessage.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const linkedUser = updated.email
      ? await User.findOne({ email: updated.email }).select("notificationPreferences")
      : null;

    let emailResult = null;
    if (updated.email) {
      emailResult = await sendEmail(updated.email, updated);
      if (!emailResult || !emailResult.ok) {
        console.warn("Support status updated, but email failed", {
          ticketId: updated._id,
          email: updated.email,
          error: emailResult && emailResult.error ? emailResult.error : "Unknown email error",
        });
      }
    }

    res.json({
      ticket: updated,
      email: emailResult || { ok: false, error: "No recipient email" },
    });
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ error: "Failed to update ticket status" });
  }
});

module.exports = router;
