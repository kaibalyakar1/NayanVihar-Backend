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

connectDB();
app.use(express.json());
app.use(cors());
//import routes
app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
