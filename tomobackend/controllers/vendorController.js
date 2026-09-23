// controllers/vendorController.js
const PendingVendor = require('../models/PendingVendor');
const bcrypt = require('bcryptjs');

exports.registerVendor = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      ownerFullName, restaurantName, restaurantAddress, contactEmail, whatsappNumber,
      workingDays, timings,
      outletType, panNumber, gstin, bankIfsc, bankAccount, fssaiNumber,
      hasPos, foodType, cuisines, costForTwo, packagingChargeType
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, Email, and Password are required." });
    }

    const existing = await PendingVendor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already submitted for approval." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Process files
    let panImage = "";
    let menuFile = "";
    let proofDocument = "";
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'panImage') panImage = file.path;
        else if (file.fieldname === 'menuFile') menuFile = file.path;
        else if (file.fieldname === 'proof') proofDocument = file.path; // fallback/legacy
      });
    }

    // Parse JSON fields if they are sent as strings
    let parsedWorkingDays = [];
    let parsedTimings = { sameAllDays: true, timeSlots: [] };
    let parsedCuisines = [];

    try {
      if (workingDays) parsedWorkingDays = JSON.parse(workingDays);
      if (timings) parsedTimings = JSON.parse(timings);
      if (cuisines) parsedCuisines = JSON.parse(cuisines);
    } catch (e) {
      console.log("Error parsing JSON fields:", e);
    }

    const newVendor = new PendingVendor({
      name, email, password: hashedPassword, phone,
      proofDocument,
      ownerFullName, restaurantName, restaurantAddress, contactEmail, whatsappNumber,
      workingDays: parsedWorkingDays, timings: parsedTimings,
      outletType, panNumber, panImage, gstin, bankIfsc, bankAccount, fssaiNumber,
      hasPos: hasPos === 'true' || hasPos === true,
      foodType, cuisines: parsedCuisines, costForTwo: Number(costForTwo) || 0,
      menuFile, packagingChargeType
    });

    await newVendor.save();
    res.status(201).json({ message: "Vendor request submitted for verification." });
  } catch (err) {
    console.error("Vendor registration error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};
