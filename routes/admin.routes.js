const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controllers");
const verifyAdmin = require("../middlewares/admin.middlewares");
const auth = require("../middlewares/auth.middleware");
router.get(
  "/users",
  verifyAdmin,
  auth,
  adminController.getAllUsersWithPayments
);
module.exports = router;
