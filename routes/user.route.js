const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controllers");
const authenticate = require("../middlewares/auth.middleware");

router.get("/profile", authenticate, userController.getUserProfile);
module.exports = router;
