const User = require("../models/users.models");
const Payment = require("../models/payments.models");
const XLSX = require("xlsx");
// Fetch all users with payment history
const getAllUsersWithPayments = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    // console.log("Fetched Users:", users); // Debugging line///////

    const usersWithPayments = await Promise.all(
      users.map(async (user) => {
        try {
          // console.log(`Fetching payments for user ${user._id}`); // Debugging line
          const payments = await Payment.find({ userId: user._id }).select(
            "month year amount status paidDate razorpayPaymentId"
          );

          console.log(`Payments for user ${user._id}:`, payments); // Debugging line/

          return {
            user: {
              name: user.name,
              houseNumber: user.houseNumber,
              phoneNumber: user.phoneNumber,
              email: user.email,
            },
            payments: {
              payments: payments.month,
            },
            payments: [],
          };
        } catch (error) {
          console.error(`Error fetching payments for user ${user._id}:`, error);
          return {
            user: {
              name: user.name,
              houseNumber: user.houseNumber,
              phoneNumber: user.phoneNumber,
              email: user.email,
            },
            payments: {
              payments: payments.month,
            },
            payments: [],
          };
        }
      })
    );

    res.status(200).json(usersWithPayments);
  } catch (error) {
    // Log error details for debugging
    console.error("Error fetching users and payments:", error);
    // Send error response
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const downloadAll = async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const wsData = users.map((user) => ({
      Name: user.name,
      Email: user.email,
      PhoneNo: user.phoneNumber,
      HouseNo: user.houseNumber,
      // Add other fields as necessary
    }));

    // Create a new workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    // Write the file and send it to the client
    res.setHeader("Content-Disposition", "attachment; filename=All_Users.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.end(XLSX.write(wb, { bookType: "xlsx", type: "buffer" }));
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).json({ message: "Error generating Excel file" });
  }
};

module.exports = { getAllUsersWithPayments, downloadAll };
