const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "tomovendorsecretkey";

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.vendorId = decoded.id || decoded._id; // Support both payload shapes
    if (!req.vendorId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
