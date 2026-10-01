const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

module.exports = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.deviceId = decoded.deviceId;
    
    // Check if device was revoked
    if (req.deviceId) {
      const user = await User.findById(req.userId).select("devices");
      if (user && user.devices) {
        const deviceExists = user.devices.some(d => d.deviceId === req.deviceId);
        if (!deviceExists) {
          return res.status(401).json({ message: "Session expired or revoked" });
        }
      }
    }
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};