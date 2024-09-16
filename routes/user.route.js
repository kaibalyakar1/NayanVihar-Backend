const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controllers");
const authenticate = require("../middlewares/auth.middleware");
const excelMid = require("../middlewares/excel.middlware");
router.get("/profile", authenticate, userController.getUserProfile);
router.get("/download-self", excelMid, userController.downloadSelf);
module.exports = router;
