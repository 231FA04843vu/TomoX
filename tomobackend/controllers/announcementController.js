// controllers/announcementController.js
const Announcement = require("../models/announcementModel");

// GET all announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcements" });
  }
};

// POST a new announcement
const createAnnouncement = async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: "Title and message are required" });
  }

  try {
    const newAnnouncement = new Announcement({ title, message });
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: "Error creating announcement" });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
};
