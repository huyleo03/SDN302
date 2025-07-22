const express = require("express");
const router = express.Router();
const { registerUser, login, loginGoogle } = require("../controllers/userController");

// Register route
router.post("/register", registerUser);
router.post("/login", login);
router.post("/login/google", loginGoogle);

module.exports = router;
