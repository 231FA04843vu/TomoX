const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const exists = await Admin.findOne({ email: "admin@tomo.com" });
    if (exists) {
      console.log("Admin already exists.");
      process.exit();
    }

    const admin = new Admin({
      email: "admin@tomo.com",
      password: "admin123", // Will be hashed automatically
    });

    await admin.save();
    console.log("Admin created successfully!");
    process.exit();
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
