// models/Banner.js
const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  image: String,
  imagePublicId: String,
  title: String,
  link: String,
  sourceText: String,
  occasion: String,
  bannerType: String,
  theme: String,
  isAiGenerated: {
    type: Boolean,
    default: false,
  },
  palette: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Banner", bannerSchema);
