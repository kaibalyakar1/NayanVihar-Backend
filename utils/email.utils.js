const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.PASSWORD, // Your password or app-specific password
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL, // Sender's email
    to, // Recipient's email
    subject, // Subject of the email
    text, // Body of the email
  };

  try {
    await transport.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Failed to send email", err);
    throw err; // Re-throw the error to handle it in your controllers
  }
};

module.exports = { sendEmail };
