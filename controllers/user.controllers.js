const User = require("../models/users.models");
const XLSX = require("xlsx");
const mongoose = require("mongoose");
const Payment = require("../models/payments.models");
const getUserProfile = async (req, res) => {
  try {
    // Extract phoneNumber from the decoded token (req.user)
    const { phoneNumber } = req.user;

    if (!phoneNumber) {
      return res
        .status(400)
        .json({ message: "Phone number not found in token" });
    }

    // Find user by phone number and exclude the password from the response
    const user = await User.findOne({ phoneNumber }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user data", error: error.message });
  }
};
// Correct path to your User model

// Ensure correct path

// Ensure you have required the XLSX module

const downloadSelf = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is attached to the request object
    const payments = await PaymentModel.find({ userId });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments" });
  }
  try {
    // Extract userId from req.user (assuming authMiddleware attaches it)
    const userId = req.user.id;
    console.log("User ID:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is not provided" });
    }

    // Fetch the user based on userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare the data for the Excel file
    const data = [
      {
        Name: user.name || "N/A",
        HouseNumber: user.houseNumber || "N/A",
        PaidMonths: Array.isArray(user.paidMonths)
          ? user.paidMonths.join(", ")
          : "N/A",
        AmountPaid: user.amountPaid || "N/A",
      },
    ];

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Your Payments");

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    // Set headers to indicate a file attachment
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=your-payments.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send the Excel file buffer as response
    res.end(excelBuffer);
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).json({ message: "Error generating Excel file" });
  }
};

// Import mongoose to use Types.ObjectId

const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.userId; // Use the userId from the decoded token
    // Convert the userId to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    const payments = await Payment.find({ userId: objectId }); // Query using ObjectId
    if (!payments.length) {
      return res
        .status(404)
        .json({ message: "No payments found for this user" });
    }

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

module.exports = {
  getUserProfile,
  downloadSelf,
  getUserPayments,
};
