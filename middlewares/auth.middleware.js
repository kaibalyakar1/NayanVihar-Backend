const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Log the incoming headers
  console.log("Headers:", req.headers);

  // Extract token from Authorization header
  const authHeader = req.headers["authorization"];

  // Check if the token starts with 'Bearer' and extract the token part
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  console.log("Extracted Token:", token);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user info to the request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
};

module.exports = authMiddleware;
