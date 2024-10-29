const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  coinbaseLogin,
  coinbaseCallback,
  refreshToken,
} = require("../controllers/authController");
const { isAuth } = require("../middleware/authMiddleware"); // Import isAuth from the combined middleware

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/profile", isAuth, getProfile); // Protect the profile route with isAuth

router.get("/coinbase/login", coinbaseLogin);
router.get("/coinbase/callback", coinbaseCallback);
router.post("/refresh", isAuth, refreshToken);

module.exports = router;
