const User = require("../models/users.models");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const otpService = require("../utils/otp.utils");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const emailService = require("../utils/email.utils");
const signup = async (req, res) => {
  const { name, houseNumber, phoneNumber, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      name,
      email,
      phoneNumber,
      houseNumber,
      password: hashedPassword,
      otp,
      otpExpiresAt,
    });

    // Send OTP via Twilio
    await otpService.sendOtp(phoneNumber, otp);

    res.status(201).json({
      message: "OTP sent to your phone. Please verify.",
      userId: newUser._id.toString(), // Ensure it is a string
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the OTP is valid and not expired
    if (user.otp === otp && user.otpExpiresAt > Date.now()) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", err });
    console.log(err);
  }
};

const login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user || !user.isVerified) {
      return res
        .status(404)
        .json({ message: "User not found or not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", err });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    // Save OTP and expiration to user
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP via email
    await emailService.sendEmail(
      user.email, // recipient's email
      "Reset Password OTP", // subject
      `Your OTP is: ${otp}` // email body
    );

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
    console.error(err);
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear OTP fields
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
module.exports = { signup, verifyOTP, login, forgotPassword, resetPassword };
