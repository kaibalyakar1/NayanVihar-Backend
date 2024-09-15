const User = require("../models/users.models");
const Payment = require("../models/payments.models");

// Fetch all users with payment history
const getAllUsersWithPayments = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    console.log("Fetched Users:", users); // Debugging line

    const usersWithPayments = await Promise.all(
      users.map(async (user) => {
        try {
          console.log(`Fetching payments for user ${user._id}`); // Debugging line
          const payments = await Payment.find({ userId: user._id }).select(
            "month year amount status paidDate razorpayPaymentId"
          );

          console.log(`Payments for user ${user._id}:`, payments); // Debugging line

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

module.exports = { getAllUsersWithPayments };
