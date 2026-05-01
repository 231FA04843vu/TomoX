// TOMOBACKEND/seedBanners.js
const mongoose = require("mongoose");
require("dotenv").config();
const Banner = require("./models/Banner");

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not set. Add it to your environment before running seedBanners.js");
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedBanners = async () => {
  try {
    await Banner.deleteMany(); // (optional) clear existing banners
    await Banner.insertMany([
      [
  {
    "image": "https://cdn.pixabay.com/photo/2020/04/06/16/46/banner-5000290_1280.jpg",
    "title": "Flat 50% Off!",
    "link": "/offers"
  },
  {
    "image": "https://cdn.pixabay.com/photo/2022/01/18/20/36/burger-6948515_1280.jpg",
    "title": "Burger Bonanza",
    "link": "/restaurant/burgers"
  },
  {
    "image": "https://cdn.pixabay.com/photo/2021/06/15/20/02/pizza-6338865_1280.jpg",
    "title": "Pizza Lovers Deal",
    "link": "/restaurant/pizza"
  }
]

    ]);
    console.log("✅ Banners added");
  } catch (err) {
    console.error("❌ Seeding failed", err);
  } finally {
    mongoose.connection.close();
  }
};

seedBanners();
