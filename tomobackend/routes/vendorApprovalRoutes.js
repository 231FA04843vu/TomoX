const express = require("express");
const router = express.Router();
const PendingVendor = require("../models/PendingVendor");
const Vendor = require("../models/Vendor");
const nodemailer = require("nodemailer");
const CUSTOMER_APP_URL = "https://tomox.netlify.app";
const VENDOR_APP_URL = "https://tvendor.netlify.app";

// 🔐 Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Approve Vendor Route
router.post("/approve/:id", async (req, res) => {
  try {
    console.log("✅ Approve request for ID:", req.params.id);

    const pendingVendor = await PendingVendor.findById(req.params.id);
    if (!pendingVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    console.log("✅ Found Vendor:", pendingVendor.email);

    // ⚠️ No re-hashing — use the existing hashed password
    const newVendor = new Vendor({
      name: pendingVendor.name,
      email: pendingVendor.email,
      password: pendingVendor.password, // ✅ Use hashed password directly
      phone: pendingVendor.phone || "",
      cuisine: [],
      location: "",
      logo: "",
      menu: [],
    });

    await newVendor.save();
    await PendingVendor.findByIdAndDelete(pendingVendor._id);

    // 📧 Send approval email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: pendingVendor.email,
      subject: "🎉 Vendor Approved - TomoX",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background-color: #f9f9f9; color: #333;">
          <h2 style="color: #28a745;">🎉 Congratulations, ${pendingVendor.name}!</h2>
          <p>Your request for <strong>vendor registration</strong> with <strong>TomoX</strong> has been <span style="color: #28a745;"><strong>successfully approved</strong></span>.</p>
          <p>You can now log in to your vendor dashboard to complete your profile, upload your menu, and begin receiving customer orders.</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${VENDOR_APP_URL}/login" style="background-color: #28a745; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">🔐 Click here to Log In</a>
          </p>
          
          <hr style="margin: 30px 0;" />
          <h3 style="color: #333;">💡 Why join TomoX?</h3>
          <ul style="padding-left: 20px;">
            <li>Reach thousands of hungry customers daily</li>
            <li>Easy-to-manage vendor dashboard</li>
            <li>Real-time order tracking and updates</li>
            <li>24/7 support from the TomoX team</li>
            <li>Performance analytics & restaurant insights</li>
          </ul>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            📜 By accessing your account, you agree to TomoX's <a href="${CUSTOMER_APP_URL}/terms" style="color: #28a745;">Terms & Conditions</a> and Privacy Policy. Please make sure to review them.
          </p>

          <p style="margin-top: 30px; font-weight: 500;">Thank you for choosing TomoX – we’re excited to grow with you!</p>
          <p><strong>– TomoX Vendorship Support Team</strong></p>
        </div>

      `,
    });

    res.json({ message: "Vendor approved and notified via email." });
  } catch (err) {
    console.error("❌ Approval error:", err);
    res.status(500).json({ error: "Approval failed" });
  }
});

// ❌ Reject Vendor Route
router.post("/reject/:id", async (req, res) => {
  try {
    const pendingVendor = await PendingVendor.findById(req.params.id);
    if (!pendingVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: pendingVendor.email,
      subject: "❌ Vendor Application Rejected - TomoX",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #fff7f7; border: 1px solid #ffd5d5; border-radius: 8px;">
          <h2 style="color: #d9534f;">❌ Application Rejected</h2>
          <p>Dear ${pendingVendor.name},</p>
          <p>We regret to inform you that your vendor registration with <strong>TomoX</strong> has been <strong>rejected</strong> after careful review.</p>
          <p>If you believe this was a mistake or would like to appeal, please contact our support team. You may also reapply with proper documentation.</p>
          <p>Vendor portal: <a href="${VENDOR_APP_URL}">${VENDOR_APP_URL}</a></p>
          <p>Customer site: <a href="${CUSTOMER_APP_URL}">${CUSTOMER_APP_URL}</a></p>
          <p style="margin-top: 20px;"><strong>– TomoX Vendorship Support Team</strong></p>
        </div>

      `,
    });

    await PendingVendor.findByIdAndDelete(pendingVendor._id);

    res.json({ message: "Vendor rejected and notified via email." });
  } catch (err) {
    console.error("❌ Rejection error:", err);
    res.status(500).json({ error: "Rejection failed" });
  }
});

module.exports = router;
