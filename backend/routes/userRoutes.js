const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyCode,
  googleLogin,
  updateProfile,
  getUserProfile,
} = require("../controllers/userController");

const auth = require("../middlewares/authentication");``

// Register route
router.post("/register", register);
router.post("/login", login);
router.post("/resend-verification");
router.post("/verify-code", verifyCode);
router.post("/google-login", googleLogin);
router.put("/user/update-profile", auth, updateProfile);
router.get("/user/profile", auth, getUserProfile);

module.exports = router;
