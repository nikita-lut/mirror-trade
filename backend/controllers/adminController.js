const User = require("../models/User");

const { default: axios } = require("axios");
const crypto = require("crypto");

async function getMarketPrice(productID, token) {
  try {
    const product = await axios.get(
      `https://api.coinbase.com/api/v3/brokerage/products/${productID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const marketPrice = product.data.price; // Current market price
    // console.log(product.data);
    return {
      price: Number(marketPrice),
      increment: product.data.base_increment,
    };
  } catch (error) {
    console.error("Error fetching market price:");
    return null;
  }
}

function generateUUID() {
  return crypto.randomUUID(); // Only available in Node.js v15.6.0+
}

// Pseudo function for executing trade
const executeTrade = async (coin, amount, token) => {
  const uuid = generateUUID();
  try {
    const order = {
      product_id: `${coin}-USDC`, // Assuming we are trading with USD
      side: amount > 0 ? "BUY" : "SELL", // Determine side based on amount
      client_order_id: uuid,
      order_configuration: {
        market_market_ioc:
          amount > 0
            ? {
                quote_size: Math.abs(amount).toString(),
              }
            : {
                base_size: Math.abs(amount).toString(),
              },
      },
    };
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.coinbase.com/api/v3/brokerage/orders",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: order,
    };

    const res = await axios.request(config);
    console.log(res.data);
    if (res?.data.success) {
      return res.data.success_response;
    }
    return null;
  } catch (err) {
    console.error("Error executing trade:", err);
    throw err; // Propagate error for handling
  }
};

// Get Total Profit/Loss
const getUserProfitLoss = (holdings, marketPrices) => {
  const _holdings = [];
  for (let i = 0; i < holdings.length; i++) {
    const holding = holdings[i];
    if (holding && holding.coin) {
      const dif = marketPrices[holding.coin] - holding.price;
      holding.profitLoss = dif * holding.amount;
      _holdings.push(holding);
    }
  }
  return _holdings;
};

// Get data for Admin Dashboard
const getDashboardData = async (req, res) => {
  const cUser = req.user;
  try {
    const users = await User.find({ mainAccount: req.user.username });
    const userCount = users.length;

    const coins = Object.keys(cUser.allocations) || [];
    const _prices = coins.map(async (coin) => {
      const { price } = await getMarketPrice(
        `${coin}-USDC`,
        cUser.coinbaseToken
      );
      return {
        [coin]: price,
      };
    });
    const prices = await Promise.all(_prices);
    const marketPrices = Object.assign({}, ...prices);

    const userStats = users.map((user) => {
      const holdings = getUserProfitLoss(user.holdings || [], marketPrices);
      const totalProfitLoss = holdings.reduce(
        (acc, holding) => acc + holding.profitLoss,
        0
      );
      return {
        id: user.name,
        usdcBalance: user.totalFund,
        profitLoss: totalProfitLoss,
      };
    });

    const totalProfitLoss = userStats.reduce(
      (acc, user) => acc + user.profitLoss,
      0
    );
    const response = await axios
      .get("https://api.coinbase.com/api/v3/brokerage/accounts", {
        headers: {
          Authorization: `Bearer ${cUser.coinbaseToken}`,
        },
      })
      .catch((err) => console.log("Account getting error"));

    const { accounts } = response.data;
    const availbles = accounts.filter(
      (account) =>
        account.currency !== "USDC" &&
        Number(account.available_balance.value) > 0
    );
    const stat = {
      allocations: cUser.allocations,
      holdings: availbles.map((account) => ({
        [account.currency]: account.available_balance.value,
      })),
    };
    res.status(200).json({
      userCount,
      userStats,
      totalProfitLoss,
      stat,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching dashboard data", error: err.message });
  }
};

// Set total USDC for Main Account
const setMainAccountFunds = async (req, res) => {
  const { totalUsdc } = req.body;
  const user = req.user;

  try {
    if (user.mainAccount) {
      const mainAcc = await User.findOne({ username: user.mainAccount });
      user.allocations = mainAcc.allocations;
    }
    if (!user || !user.allocations || !totalUsdc) {
      console.log(user.allocations);
      res.status(500).json({
        message: "Error updating Main Account funds",
        error: "allocation or amount is not defined.",
      });
      return;
    } else {
      const response = await axios
        .get("https://api.coinbase.com/api/v3/brokerage/accounts", {
          headers: {
            Authorization: `Bearer ${user.coinbaseToken}`,
          },
        })
        .catch((err) => console.log("Account getting error"));

      const { accounts } = response.data;

      if (!accounts) throw new Error("No accounts found");
      const usdcAccount = accounts.find(
        (account) => account.currency === "USDC"
      );
      if (!usdcAccount) throw new Error("No USDC account found");

      const usdcBalance = usdcAccount.available_balance.value;
      if (Number(usdcBalance) < Number(totalUsdc))
        throw new Error("Insufficient USDC balance");
      const holdings = user.holdings;

      const order_ids = await buyCoins(totalUsdc, user);

      const order_res = await axios
        .get(
          `https://api.coinbase.com/api/v3/brokerage/orders/historical/batch?${order_ids.join(
            "&"
          )}`,
          {
            headers: {
              Authorization: `Bearer ${user.coinbaseToken}`,
            },
          }
        )
        .catch((err) => console.log("Orders getting error"));

      const { orders } = order_res.data;
      orders.map((order) => {
        if (order.status === "FILLED") {
          const coin = order.product_id.split("-")[0];
          holdings.push({
            coin,
            amount: Number(order.filled_size),
            price: Number(order.average_filled_price),
          });
        }
      });
      user.fund = totalUsdc;
      user.totalFund += Number(totalUsdc);
      user.holdings = holdings;
      await user.save();
    }
    res
      .status(200)
      .json({ message: "Main account funds updated successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error updating Main Account funds",
      error: err.message,
    });
  }
};

const buyCoins = async (totalUsdc, user) => {
  const allocations = user.allocations;
  const order_ids = [];
  const factor = Math.pow(10, 2);
  for (const coin in allocations) {
    const targetPercentage = Number(allocations[coin]);
    const amountToBuyOrSell = totalUsdc * (targetPercentage / 100); // Calculate based on total USDC and targetPercentage
    // Execute trades on the exchange (Coinbase or other)
    const result = await executeTrade(
      coin,
      Math.floor(amountToBuyOrSell * factor) / factor,
      user.coinbaseToken
    );
    if (result) order_ids.push("order_ids=" + result.order_id);
  }
  return order_ids;
};

// Allocate coins to Main Account
const allocateCoins = async (req, res) => {
  const { allocations } = req.body; // allocations should be an object with coin names and their percentages

  try {
    const mainAccount = req.user;
    if (!mainAccount)
      return res.status(404).json({ message: "Main Account not found" });

    const coins = Object.keys(allocations) || [];
    const _incs = coins.map(async (coin) => {
      const { increment } = await getMarketPrice(
        `${coin}-USDC`,
        mainAccount.coinbaseToken
      );
      return {
        [coin]: increment,
      };
    });
    const incs = await Promise.all(_incs);

    mainAccount.increments = Object.assign({}, ...incs); // Save increments
    mainAccount.allocations = allocations;

    await mainAccount.save();

    res.status(200).json({ message: "Allocations updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating allocations", error: err.message });
  }
};

// Rebalance funds in Main Account
const rebalanceFunds = async (req, res) => {
  const { allocations } = req.body;

  try {
    const user = req.user;
    if (!user.allocations)
      return res.status(404).json({ message: "Allocations not found" });
    if (!user.holdings.length)
      return res.status(404).json({ message: "Holdings not found" });
    // Logic to rebalance funds according to the allocations
    let order_ids = await sellAllCoins(user);
    let usdcLocked = 0;
    let order_res = await axios
      .get(
        `https://api.coinbase.com/api/v3/brokerage/orders/historical/batch?${order_ids.join(
          "&"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${user.coinbaseToken}`,
          },
        }
      )
      .catch((err) => console.log("Orders getting error"));

    let orders = order_res.data.orders;
    orders.map((order) => {
      if (order.status === "FILLED") {
        usdcLocked += Number(order.total_value_after_fees);
      }
    });
    console.log("sold usdc balance", usdcLocked);
    // Save updated allocations back to the main account
    user.allocations = allocations;
    order_ids = await buyCoins(usdcLocked, user);
    const holdings = [];
    order_res = await axios
      .get(
        `https://api.coinbase.com/api/v3/brokerage/orders/historical/batch?${order_ids.join(
          "&"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${user.coinbaseToken}`,
          },
        }
      )
      .catch((err) => console.log("Orders getting error"));

    orders = order_res.data.orders;
    orders.map((order) => {
      if (order.status === "FILLED") {
        const coin = order.product_id.split("-")[0];
        holdings.push({
          coin,
          amount: Number(order.filled_size),
          price: Number(order.average_filled_price),
        });
      }
    });
    user.holdings = holdings;
    const coins = Object.keys(allocations) || [];
    const _incs = coins.map(async (coin) => {
      const { increment } = await getMarketPrice(
        `${coin}-USDC`,
        user.coinbaseToken
      );
      return {
        [coin]: increment,
      };
    });
    const incs = await Promise.all(_incs);

    user.increments = Object.assign({}, ...incs); // Save increments
    await user.save();

    res.status(200).json({ message: "Funds rebalanced successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error rebalancing funds", error: err.message });
  }
};

async function sellAllCoins(user) {
  // Logic to sell all holdings and convert to USDC
  const holdings = user.holdings.reduce((acc, current) => {
    // Check if an object with the same id already exists in the accumulator
    const existing = acc.find((item) => item.coin === current.coin);

    if (existing) {
      // If found, merge the values (in this case, summing them)
      existing.amount += current.amount;
    } else {
      // Otherwise, add the current object to the accumulator
      acc.push({ ...current });
    }

    return acc;
  }, []);
  const increments = user.increments;
  const order_ids = [];
  for (const holding of holdings) {
    if (!holding.coin) continue;
    const factor = 1 / Number(increments[holding.coin]);
    const result = await executeTrade(
      holding.coin,
      -Math.floor(holding.amount * factor) / factor,
      user.coinbaseToken
    ); // Sell all holdings
    if (result) {
      order_ids.push("order_ids=" + result.order_id);
    }
  }
  return order_ids;
}

module.exports = {
  getDashboardData,
  setMainAccountFunds,
  allocateCoins,
  rebalanceFunds,
  getMarketPrice,
  sellAllCoins,
  getUserProfitLoss,
};
