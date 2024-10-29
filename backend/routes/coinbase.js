const express = require("express");
const {
  fetchCoinbaseAccounts,
  linkCoinbaseAccount,
} = require("../controllers/coinbaseController");
const { isAuth } = require("../middlewares/authMiddleware"); // Ensure this middleware checks for user authentication

const router = express.Router();

// Link Coinbase account
router.post("/link", isAuth, linkCoinbaseAccount);

// Fetch Coinbase accounts
router.get("/accounts", isAuth, fetchCoinbaseAccounts);

module.exports = router;
