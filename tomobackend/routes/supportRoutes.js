const express = require("express");
const router = express.Router();
const SupportMessage = require("../models/SupportMessage");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// POST /api/support - create a new support message
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, orderId, message } = req.body;

    const newMessage = new SupportMessage({
      name,
      email,
      phone: phone || "",
      orderId: orderId || "No order ID",
      message,
    });

    await newMessage.save();
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

// GET /api/support - get all support messages
router.get("/", async (req, res) => {
  try {
    const messages = await SupportMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve support messages." });
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
