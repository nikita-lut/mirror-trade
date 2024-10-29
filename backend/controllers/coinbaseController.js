const User = require("../models/User");

// Link Coinbase Account
exports.linkCoinbaseAccount = async (req, res) => {
  const { accessToken } = req.body;

  // Store the access token securely (e.g., in user profile)
  try {
    const user = await User.findById(req.user.id); // Assume req.user contains authenticated user data
    user.coinbaseToken = accessToken;
    await user.save();

    res.status(200).json({ message: "Coinbase account linked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch user accounts from Coinbase
exports.fetchCoinbaseAccounts = async (req, res) => {
  const user = await User.findById(req.user.id); // Ensure the user is authenticated
  const accessToken = user.coinbaseToken;

  try {
    const response = await axios.get("https://api.coinbase.com/v2/accounts", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    res.status(200).json(response.data); // Return account data
  } catch (error) {
    console.error(
      "Error fetching accounts from Coinbase:",
      error.response.data
    );
    res.status(500).json({ message: "Error fetching accounts" });
  }
};
