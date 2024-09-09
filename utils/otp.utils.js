const otGenerator = require("otp-generator");
const twilio = require("twilio");
const dotenv = require("dotenv");

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateOTP = () => {
  return otGenerator.generate(6, {
    digits: true,
    alphabets: false,
    specialChars: false,
  });
};

const sendOtp = async (phoneNumber, otp) => {
  client.messages
    .create({
      body: `Your OTP code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio phone number
      to: phoneNumber, // User's phone number
    })
    .then((message) => console.log(`OTP sent successfully: ${message.sid}`))
    .catch((error) => console.error("Failed to send OTP:", error));
};

module.exports = { generateOTP, sendOtp };
