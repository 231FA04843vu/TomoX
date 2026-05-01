const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./config/db");
const Vendor = require("./models/Vendor");

const dummyVendors = [
  {
    name: "Spicy Bites",
    logo: "https://cdn.pixabay.com/photo/2017/09/02/13/46/restaurant-2703907_1280.jpg",
    cuisine: ["Indian", "Chinese"],
    location: "Hyderabad",
    rating: 4.2,
    menu: [
      {
        name: "Paneer Butter Masala",
        price: 180,
        image: "https://cdn.pixabay.com/photo/2020/08/16/18/17/indian-food-5494699_1280.jpg",
        description: "Creamy paneer curry with spices",
      },
      {
        name: "Veg Manchurian",
        price: 150,
        image: "https://cdn.pixabay.com/photo/2022/11/15/11/40/food-7593971_1280.jpg",
        description: "Crispy veggie balls in tangy sauce",
      },
    ],
  },
  {
    name: "Pizza Point",
    logo: "https://cdn.pixabay.com/photo/2017/03/27/14/56/pizza-2179183_1280.jpg",
    cuisine: ["Italian"],
    location: "Bangalore",
    rating: 4.5,
    menu: [
      {
        name: "Margherita Pizza",
        price: 220,
        image: "https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg",
        description: "Classic cheese pizza with fresh basil",
      },
      {
        name: "Pepperoni Pizza",
        price: 250,
        image: "https://cdn.pixabay.com/photo/2021/03/08/11/59/pizza-6078176_1280.jpg",
        description: "Pepperoni topped cheesy delight",
      },
    ],
  },
];

async function seedVendors() {
  try {
    await connectDB();
    await Vendor.deleteMany(); // Clear previous data
    await Vendor.insertMany(dummyVendors);
    console.log("✅ Vendors seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding vendors:", error);
    process.exit(1);
  }
}

seedVendors();
