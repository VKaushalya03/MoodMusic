const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  googleLogin,
  updatePassword, // <--- Import
  forgotPassword, // <--- Import
  resetPassword, // <--- Import
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

// Existing Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.get("/me", auth, getUserProfile);

// ✅ NEW ROUTES
router.put("/updatepassword", auth, updatePassword); // Protected (Profile)
router.post("/forgotpassword", forgotPassword); // Public (Login Screen)
router.put("/resetpassword/:resetToken", resetPassword); // Public (Email Link)

module.exports = router;
