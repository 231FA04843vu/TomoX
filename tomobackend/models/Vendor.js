const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    // Step 1: Restaurant Info
    ownerFullName: { type: String, default: "" },
    restaurantName: { type: String, default: "" },
    restaurantAddress: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    workingDays: { type: [String], default: [] },
    timings: {
      sameAllDays: { type: Boolean, default: true },
      timeSlots: [{ open: String, close: String }]
    },
    // Step 2: Documents
    outletType: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    panImage: { type: String, default: "" },
    gstin: { type: String, default: "" },
    bankIfsc: { type: String, default: "" },
    bankAccount: { type: String, default: "" },
    fssaiNumber: { type: String, default: "" },
    // Step 3: Menu Setup
    hasPos: { type: Boolean, default: false },
    foodType: { type: String, default: "" },
    cuisines: { type: [String], default: [] },
    costForTwo: { type: Number, default: 0 },
    menuFile: { type: String, default: "" },
    packagingChargeType: { type: String, default: "" },
    
    notificationPreferences: {
      email: { type: Boolean, default: true },
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
