const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.login);
router.post("/registration", authController.registration);
router.post("/verify-email", authController.verifyEmail);
router.get("/refresh", authController.refresh);
router.get("/logout", authController.logout);

module.exports = router;
