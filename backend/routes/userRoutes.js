const express = require("express");
const { isAuth } = require("../middleware/authMiddleware");
const {
  getUserDashboard,
  liquidateHoldings,
} = require("../controllers/userController");

const router = express.Router();

// Protected routes for User

router.get("/dashboard", isAuth, getUserDashboard);
router.post("/liquidate", isAuth, liquidateHoldings); // Liquidate holdings route

module.exports = router;
