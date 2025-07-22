const express = require("express");
const router = express.Router();
const passport = require("../passport"); // Không destructure { passport }

const { registerUser, login, loginGoogle } = require("../controllers/userController");

// Register route
router.post("/register", registerUser);
router.post("/login", login);
router.post("/login/google", loginGoogle);

// Google OAuth callback
router.get("/google/callback", passport.authenticate("google", {
  successRedirect: "http://localhost:3000",
  failureRedirect: "http://localhost:3000/login",
}));

module.exports = router;
