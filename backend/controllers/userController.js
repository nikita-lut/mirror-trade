const { default: axios } = require("axios");
const User = require("../models/User");
const {
  getMarketPrice,
  sellAllCoins,
  getUserProfitLoss,
} = require("./adminController");

// Get user dashboard data
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is stored in req.user from the auth middleware
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    const coins = Object.keys(user.allocations) || [];
    const _prices = coins.map(async (coin) => {
      const price = await getMarketPrice(`${coin}-USDC`, user.coinbaseToken);
      return {
        [coin]: price,
      };
    });
    const prices = await Promise.all(_prices);
    const marketPrices = Object.assign({}, ...prices);
    const holdings = getUserProfitLoss(user.holdings || [], marketPrices);
    const totalProfitLoss = holdings.reduce(
      (acc, holding) => acc + holding.profitLoss,
      0
    );

    const response = await axios
      .get("https://api.coinbase.com/api/v3/brokerage/accounts", {
        headers: {
          Authorization: `Bearer ${user.coinbaseToken}`,
        },
      })
      .catch((err) => console.log("Account getting error"));

    const { accounts } = response.data;
    const usdcAccount = accounts.find((account) => account.currency === "USDC");
    const usdcBalance = usdcAccount.available_balance.value;
    const _holdings = holdings.reduce((acc, current) => {
      // Check if an object with the same id already exists in the accumulator
      const existing = acc.find((item) => item.coin === current.coin);

      if (existing) {
        // If found, merge the values (in this case, summing them)
        existing.amount += current.amount;
        existing.profitLoss += current.profitLoss;
      } else {
        // Otherwise, add the current object to the accumulator
        acc.push({ ...current });
      }

      return acc;
    }, []);
    res.status(200).json({
      holdings: _holdings,
      totalProfitLoss,
      usdcBalance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user dashboard", error: error.message });
  }
};

// Liquidate all holdings
const liquidateHoldings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.holdings.length === 0)
      return res.status(400).json({ message: "No holdings to liquidate" });

    await sellAllCoins(user);
    // Reset holdings and update USDC balance
    user.holdings = [];
    user.fund = 0;
    user.totalFund = 0;
    await user.save();

    res.status(200).json({ message: "All holdings liquidated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error liquidating holdings", error: error.message });
  }
};

module.exports = { getUserDashboard, liquidateHoldings };
