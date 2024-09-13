const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  razorpayPaymentId: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  paidDate: { type: Date },
});

// Check if model exists before defining it again
const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

module.exports = Payment;
