const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");

const JWT_SECRET = "your_jwt_secret"; // move this to .env in production

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: employee._id, email: employee.email }, JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({ token, employee: { name: employee.name, role: employee.role } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
