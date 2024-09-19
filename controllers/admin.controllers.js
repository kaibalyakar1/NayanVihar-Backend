const User = require("../models/users.models");
const Payment = require("../models/payments.models");
const XLSX = require("xlsx");
// Fetch all users with payment history
const getAllUsersWithPayments = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    // Fetch payments for each user
    const usersWithPayments = await Promise.all(
      users.map(async (user) => {
        try {
          // Fetch payments for the current user
          const payments = await Payment.find({ userId: user._id }).select(
            "month year amount status paidDate razorpayPaymentId"
          );

          return {
            user: {
              name: user.name,
              houseNumber: user.houseNumber,
              phoneNumber: user.phoneNumber,
              email: user.email,
            },
            payments: payments, // Return the entire payments array
          };
        } catch (error) {
          console.error(`Error fetching payments for user ${user._id}:`, error);
          // Handle the error gracefully
          return {
            user: {
              name: user.name,
              houseNumber: user.houseNumber,
              phoneNumber: user.phoneNumber,
              email: user.email,
            },
            payments: [], // Return an empty array if there was an error fetching payments
          };
        }
      })
    );

    // Send the response with users and their payments
    res.status(200).json(usersWithPayments);
  } catch (error) {
    console.error("Error fetching users and payments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const downloadAll = async (req, res) => {
  try {
    // Fetch all users with their payments
    const users = await User.find();

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Prepare the data for each user along with their payments
    const usersWithPayments = await Promise.all(
      users.map(async (user) => {
        // Fetch payments for each user
        const payments = await Payment.find({ userId: user._id }).select(
          "month year amount status paidDate"
        );

        // Create an array of formatted payments with separate fields
        const paymentData = payments.map((payment) => ({
          Month: payment.month,
          Year: payment.year,
          Amount: payment.amount,
          Status: payment.status,
          "Paid Date": payment.paidDate
            ? new Date(payment.paidDate).toLocaleDateString()
            : "N/A",
        }));

        return {
          Name: user.name,
          Email: user.email,
          PhoneNo: user.phoneNumber,
          HouseNo: user.houseNumber,
          Payments:
            paymentData.length > 0
              ? paymentData
              : [
                  {
                    Month: "N/A",
                    Year: "N/A",
                    Amount: "N/A",
                    Status: "N/A",
                  },
                ],
        };
      })
    );

    // Flatten the data so each row has user info and payment info in separate columns
    const flattenedData = usersWithPayments.flatMap((userWithPayment) => {
      const { Name, Email, PhoneNo, HouseNo, Payments } = userWithPayment;
      return Payments.map((payment) => ({
        Name,
        Email,
        PhoneNo,
        HouseNo,
        Month: payment.Month,
        Year: payment.Year,
        Amount: payment.Amount,
        Status: payment.Status,
      }));
    });

    // Create a new worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(flattenedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users with Payments");

    // Set headers and send the file as a response
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=UsersWithPayments.xlsx"
    );
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
