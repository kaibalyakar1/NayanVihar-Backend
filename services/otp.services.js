const Otp = require("../models/otp.models");
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendOtp = async (phoneNumber) => {
  // Generate a random 6-digit number and pad with leading zeros if necessary
  const otp = Math.floor(100000 + Math.random() * 900000)
    .toString()
    .padStart(6, "0");

  const otpInstance = new Otp({ phoneNumber, otp });
  await otpInstance.save();

  await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });

  return otp;
};

const verifyOtp = async (phoneNumber, otp) => {
  const otpInstance = await Otp.findOne({ phoneNumber });
  return otpInstance !== null;
};
module.exports = { sendOtp, verifyOtp };
