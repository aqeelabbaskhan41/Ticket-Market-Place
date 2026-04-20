const express = require("express");
const {
  register,
  login,
  getMe,
  googleLogin,
  // facebookLogin,
  // facebookCallback,
  setUsername,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
// router.post("/facebook", facebookLogin);
// router.post("/facebook/callback", facebookCallback);

// Protected routes
router.get("/me", protect, getMe);
router.post("/set-username", protect, setUsername);
router.post("/admin/register", protect, register);

module.exports = router;
