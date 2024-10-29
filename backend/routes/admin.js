const express = require("express");
const {
  rebalanceFunds,
  allocateCoins,
  getDashboardData,
  setMainAccountFunds,
} = require("../controllers/adminController");
const { isAuth, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected routes for Admin

router.get("/dashboard", isAuth, getDashboardData);
router.post("/funds", isAuth, setMainAccountFunds);
router.post("/allocate", isAuth, isAdmin, allocateCoins);
router.post("/rebalance", isAuth, isAdmin, rebalanceFunds); // New rebalance route

module.exports = router;
