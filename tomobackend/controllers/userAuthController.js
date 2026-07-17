const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendAccountDeletionEmail = require("../utils/sendAccountDeletionEmail");
const sendWelcomeEmail = require("../utils/sendWelcomeEmail");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

const otpStore = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const FALLBACK_OTP_CODE = "1111";
const FALLBACK_OTP_NOTICE =
  "We are experiencing a technical issue sending OTP emails. Please use the temporary code 1111 for sign up or forgot password. Sorry for the inconvenience.";

const emitUserUpdate = (req, user) => {
  const io = req.app.get("io");
  if (!io || !user) return;
  io.to(`user:${user._id}`).emit("user:update", {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarPreset: user.avatarPreset || null,
      avatarUrl: user.avatarUrl || null,
      notificationPreferences: {
        email: user.notificationPreferences?.email !== false,
      },
      addresses: user.addresses || [],
    },
  });
};

const emitCartUpdate = (req, user) => {
  const io = req.app.get("io");
  if (!io || !user) return;
  io.to(`user:${user._id}`).emit("cart:update", {
    items: user.cartItems || [],
  });
};

const getOtpEntry = (email) => {
  if (!email) return null;
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return null;
  }
  return entry;
};

function generateToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
}

const normalizeNotificationPreferences = (raw) => ({
  email: raw?.email !== false,
});

exports.signup = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    if (String(otp) === FALLBACK_OTP_CODE) {
      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "Email already registered" });

      const user = await User.create({ name, email, password });
      const token = generateToken(user);
      try {
        await sendWelcomeEmail(email, name);
      } catch (err) {
        console.error("Failed to send welcome email:", err && err.message ? err.message : err);
      }
      return res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          notificationPreferences: normalizeNotificationPreferences(user.notificationPreferences),
        },
      });
    }

    const otpEntry = getOtpEntry(email);
    if (!otpEntry || otpEntry.code !== String(otp || "")) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });
    otpStore.delete(email.toLowerCase());
    const token = generateToken(user);
    try {
      await sendWelcomeEmail(email, name);
    } catch (err) {
      console.error("Failed to send welcome email:", err && err.message ? err.message : err);
    }
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        notificationPreferences: normalizeNotificationPreferences(user.notificationPreferences),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarPreset: user.avatarPreset || null,
        avatarUrl: user.avatarUrl || null,
        notificationPreferences: normalizeNotificationPreferences(user.notificationPreferences),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.json({ user });
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.requestSignupOtp = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim();
    if (!email) return res.status(400).json({ message: "Email required" });

    const normalizedEmail = email.toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otp = FALLBACK_OTP_CODE;
    otpStore.set(normalizedEmail, {
      code: otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    res.json({
      message: FALLBACK_OTP_NOTICE,
      fallbackCode: otp,
      emailDelivery: false,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.requestResetPasswordOtp = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim();
    if (!email) return res.status(400).json({ message: "Email required" });

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const otp = FALLBACK_OTP_CODE;
    otpStore.set(normalizedEmail, {
      code: otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    res.json({
      message: FALLBACK_OTP_NOTICE,
      fallbackCode: otp,
      emailDelivery: false,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    if (String(otp) === FALLBACK_OTP_CODE) {
      return res.json({ message: "OTP verified" });
    }

    const entry = getOtpEntry(email);
    if (!entry || entry.code !== String(otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, avatarPreset, avatarUrl, notificationPreferences } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Email already registered" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatarPreset !== undefined) user.avatarPreset = avatarPreset || null;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl || null;
    if (notificationPreferences && typeof notificationPreferences === "object") {
      user.notificationPreferences = {
        email: notificationPreferences.email !== false,
      };
    }

    const saved = await user.save();
    emitUserUpdate(req, saved);
    res.json({
      user: {
        _id: saved._id,
        name: saved.name,
        email: saved.email,
        phone: saved.phone,
        avatarPreset: saved.avatarPreset || null,
        avatarUrl: saved.avatarUrl || null,
        notificationPreferences: normalizeNotificationPreferences(saved.notificationPreferences),
        addresses: saved.addresses,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

const sanitizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  
  return items
    .map((item, index) => {
      // Check for itemId in multiple places for robustness
      const itemId = item.itemId || item._id || item.id;
      
      if (!itemId) {
        console.warn("Cart item missing ID at index", index, "- skipping item");
        return null; // Skip items without valid ID
      }
      
      return {
        itemId: String(itemId), // Ensure it's a string
        name: item.name || "",
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        image: item.image || "",
        vendorId: item.vendorId || "",
        restaurantId: item.restaurantId || "",
        restaurantName: item.restaurantName || "",
      };
    })
    .filter(Boolean); // Remove null items
};

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("cartItems");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.json({ items: user.cartItems || [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

exports.updateCart = async (req, res) => {
  try {
    if (!req.userId) {
      console.error("updateCart: No userId in request");
      return res.status(401).json({ message: "Unauthorized - no userId" });
    }

    const items = req.body?.items;
    if (!Array.isArray(items)) {
      console.error("updateCart: items is not an array:", items);
      return res.status(400).json({ message: "Invalid items format" });
    }

    console.log(`[Cart Update] User: ${req.userId}, Items count: ${items.length}`);
    
    // Sanitize and validate cart items
    const sanitizedItems = sanitizeCartItems(items);
    console.log(`[Cart Update] Sanitized items count: ${sanitizedItems.length}`);

    // Use findByIdAndUpdate to avoid version conflicts with concurrent requests
    const user = await User.findByIdAndUpdate(
      req.userId,
      { cartItems: sanitizedItems },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.error("updateCart: User not found for id:", req.userId);
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    console.log(`[Cart Update] Successfully updated cart for user: ${req.userId}`);
    emitCartUpdate(req, user);
    res.json({ items: user.cartItems || [] });
  } catch (err) {
    console.error("updateCart error:", err);
    res.status(500).json({ message: "Failed to update cart", error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Password update failed" });
  }
};

const sanitizeAddress = (body) => ({
  label: body.label || "",
  line1: body.line1 || "",
  line2: body.line2 || "",
  city: body.city || "",
  state: body.state || "",
  postalCode: body.postalCode || "",
  landmark: body.landmark || "",
  phone: body.phone || "",
  isDefault: Boolean(body.isDefault),
});

const ensureDefaultAddress = (user) => {
  if (!user.addresses || user.addresses.length === 0) return;
  const hasDefault = user.addresses.some((addr) => addr.isDefault);
  if (!hasDefault) {
    user.addresses[0].isDefault = true;
  }
};

exports.listAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("addresses");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.json({ addresses: user.addresses || [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const address = sanitizeAddress(req.body);
    if (!address.line1 || !address.city) {
      return res.status(400).json({ message: "Address line and city required" });
    }

    if (address.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(address);
    ensureDefaultAddress(user);

    await user.save();
    emitUserUpdate(req, user);
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to add address" });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    const updated = sanitizeAddress(req.body);

    if (updated.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.label = updated.label;
    address.line1 = updated.line1;
    address.line2 = updated.line2;
    address.city = updated.city;
    address.state = updated.state;
    address.postalCode = updated.postalCode;
    address.landmark = updated.landmark;
    address.phone = updated.phone;
    address.isDefault = updated.isDefault;

    ensureDefaultAddress(user);
    await user.save();
    emitUserUpdate(req, user);
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to update address" });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    const wasDefault = address.isDefault;
    address.remove();
    if (wasDefault) {
      ensureDefaultAddress(user);
    }

    await user.save();
    emitUserUpdate(req, user);
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete address" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const email = user.email;
    const name = user.name;
    const preferences = normalizeNotificationPreferences(user.notificationPreferences);

    await User.deleteOne({ _id: user._id });

    if (preferences.email && email) {
      try {
        await sendAccountDeletionEmail(email, name);
      } catch (emailErr) {
        console.error("Account deleted, but deletion email failed:", emailErr && emailErr.message ? emailErr.message : emailErr);
      }
    }

    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Account deletion failed" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password required" });
    }

    if (String(otp) === FALLBACK_OTP_CODE) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Email not found" });
      }

      user.password = newPassword;
      await user.save();

      const token = generateToken(user);
      return res.json({
        token,
        user: { _id: user._id, name: user.name, email: user.email },
        message: "Password reset successful",
      });
    }

    const entry = getOtpEntry(email);
    if (!entry || entry.code !== String(otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    user.password = newPassword;
    await user.save();
    otpStore.delete(email.toLowerCase());

    const token = generateToken(user);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
};