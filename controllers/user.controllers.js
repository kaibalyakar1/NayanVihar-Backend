const User = require("../models/users.models");
const getUserProfile = async (req, res) => {
  try {
    // Extract phoneNumber from the decoded token (req.user)
    const { phoneNumber } = req.user;

    if (!phoneNumber) {
      return res
        .status(400)
        .json({ message: "Phone number not found in token" });
    }

    // Find user by phone number and exclude the password from the response
    const user = await User.findOne({ phoneNumber }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user data", error: error.message });
  }
};

module.exports = {
  getUserProfile,
};
