const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    houseNumber: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String }, // Store OTP
    otpExpiresAt: { type: Date }, // OTP expiration date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
