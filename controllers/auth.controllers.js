const User = require("../models/users.models");
const bcrypt = require("bcrypt");
const otpService = require("../utils/otp.utils");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const emailService = require("../utils/email.utils");

const signup = async (req, res) => {
  const { name, houseNumber, phoneNumber, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phoneNumber,
      houseNumber,
      password: hashedPassword,
      otp,
      otpExpiresAt,
    });

    await otpService.sendOtp(phoneNumber, otp);

    res.status(201).json({
      message: "OTP sent to your phone. Please verify.",
      userId: newUser._id.toString(),
    });
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
  }
};

const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check OTP and expiration
    if (
      user.otp === otp &&
      user.otpExpiresAt &&
      user.otpExpiresAt > Date.now()
    ) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
    console.log(err);
  }
};
const login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    // Find user by phone number
    const user = await User.findOne({ phoneNumber });

    // Check if user exists and is verified
    if (!user || !user.isVerified) {
      return res
        .status(404)
        .json({ message: "User not found or not verified" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token including userId, phoneNumber, and role
    const token = jwt.sign(
      {
        userId: user._id,
        phoneNumber: user.phoneNumber, // Include phoneNumber in the payload
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Respond with success message and token
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await emailService.sendEmail(
      user.email,
      "Reset Password OTP",
      `Your OTP is: ${otp}`
    );

    res
      .status(200)
      .json({ message: "OTP sent to your email", userId: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
    console.error(err);
  }
};

const resetPassword = async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure OTP and expiry fields are cleared
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { signup, verifyOTP, login, forgotPassword, resetPassword };
