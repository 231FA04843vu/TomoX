const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatarPreset: { type: String },
  avatarUrl: { type: String },
  notificationPreferences: {
    email: { type: Boolean, default: true },
  },
  cartItems: [
    {
      itemId: { type: String, required: true },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
      image: { type: String },
      vendorId: { type: String },
      restaurantId: { type: String },
      restaurantName: { type: String },
      _id: false, // Disable automatic _id for subdocuments
    },
  ],
  addresses: [
    {
      label: { type: String },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      postalCode: { type: String },
      landmark: { type: String },
      phone: { type: String },
      isDefault: { type: Boolean, default: false },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);