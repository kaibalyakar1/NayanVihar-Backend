const jwt = require("jsonwebtoken");
const User = require("../models/users.models");

const verifyAdmin = async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // 'Bearer token'

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database using userId from token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Check if user role is admin
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = user; // Attach user to request object if needed
    next(); // User is admin, proceed
  } catch (error) {
    console.error("Error in verifyAdmin middleware:", error); // Log the error
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyAdmin;
