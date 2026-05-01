const express = require("express");
const router = express.Router();
const Announcement = require("../models/announcementModel");
const {
  getAnnouncements,
  createAnnouncement,
} = require("../controllers/announcementController");

// GET all
router.get("/", getAnnouncements);

// POST new
router.post("/", createAnnouncement);

// PUT update
router.put("/:id", async (req, res) => {
  const { title, message } = req.body;
  try {
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, message },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
