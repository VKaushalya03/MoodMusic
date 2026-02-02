const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  googleLogin,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

// @route   POST /api/auth/register
router.post("/register", registerUser);

// @route   POST /api/auth/login
router.post("/login", loginUser);

// @route   POST /api/auth/google
router.post("/google", googleLogin);

// @route   GET /api/auth/me (Protected)
router.get("/me", auth, getUserProfile);

module.exports = router;
