const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
dotenv.config();
const app = express();
const authRoutes = require("./routes/auth.routes");
const paymentRoutes = require("./routes/payment.routes");
const userRoutes = require("./routes/user.route");
const adminRoutes = require("./routes/admin.routes");

connectDB();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);
//import routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
