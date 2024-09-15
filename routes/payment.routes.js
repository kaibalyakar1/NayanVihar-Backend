const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authenticate = require("../middlewares/auth.middleware");
// Make sure you're using the correct controller functions
router.post("/initiate-payment", paymentController.initiatePayment);
router.post("/verify-payment", paymentController.verifyPayment);
router.get("/payment-history", paymentController.getAllPayments);

module.exports = router;
