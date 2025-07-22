const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyCode,
  googleLogin,
} = require("../controllers/userController");

// Register route
router.post("/register", register);
router.post("/login", login);
router.post("/resend-verification");
router.post("/verify-code", verifyCode);
router.post("/google-login", googleLogin);

module.exports = router;
