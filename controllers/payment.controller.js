const Payment = require("../models/payments.models");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Razorpay = require("razorpay");

console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET);

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const monthMapping = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};
const initiatePayment = async (req, res) => {
  const { amount, monthmyear, phoneNumber } = req.body;

  if (!amount || !monthmyear || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const splitDate = monthmyear.split(" ");
  if (splitDate.length !== 2) {
    return res.status(400).json({ message: "Invalid monthmyear format" });
  }

  const [monthName, year] = splitDate;
  const month = monthMapping[monthName];

  if (!month) {
    return res.status(400).json({ message: "Invalid month name" });
  }

  try {
    // Generate a unique receipt ID
    const receipt = `rcpt_${phoneNumber}_${month}${year}`;

    const options = {
      amount: amount * 100, // Razorpay expects the amount in paise
      currency: "INR",
      receipt: receipt,
    };

    const order = await razorpayInstance.orders.create(options);

    const newPayment = new Payment({
      phoneNumber,
      month,
      year,
      amount,
      razorpayPaymentId: order.id,
      status: "Pending",
    });

    await newPayment.save();

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      orderId: order.id,
      amount: amount,
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({
      message: "Error initiating payment",
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res
      .status(400)
      .json({ message: "Payment ID, Order ID, and Signature are required" });
  }

  try {
    // Generate a HMAC hash to verify the Razorpay signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      // Find the payment by order ID and update status to 'Paid'
      const payment = await Payment.findOne({
        razorpayPaymentId: razorpay_order_id,
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      payment.status = "Paid";
      payment.paidDate = new Date();
      await payment.save();

      res.status(200).json({
        success: true,
        message: "Payment verified and updated successfully",
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying payment", error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const payments = await Payment.find({ userId });

    if (!payments.length) {
      return res
        .status(404)
        .json({ message: "No payment history found for this user" });
    }

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getAllPayments,
};
