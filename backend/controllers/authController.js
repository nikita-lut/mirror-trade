const { default: axios } = require("axios");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a new user
exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    console.log(username, password);
    // Create new user
    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// User Login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select("-password"); // Exclude password from response
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.coinbaseLogin = (req, res) => {
  const clientId = process.env.COINBASE_CLIENT_ID;
  const redirectUri = process.env.COINBASE_REDIRECT_URI;
  const scope =
    "wallet:user:read,wallet:accounts:read,wallet:buys:create,wallet:buys:read,wallet:sells:create,wallet:sells:read,wallet:trades:read,wallet:trades:create,wallet:transactions:read,wallet:transactions:send";

  const coinbaseAuthUrl = `https://www.coinbase.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  res.redirect(coinbaseAuthUrl);
};

exports.refreshToken = async (req, res) => {
  const user = req.user;
  try {
    const response = await axios
      .post("https://api.coinbase.com/oauth/token", {
        grant_type: "refresh_token",
        refresh_token: user.coinbaseRefreshToken,
        client_id: process.env.COINBASE_CLIENT_ID,
        client_secret: process.env.COINBASE_CLIENT_SECRET,
      })
      .catch((error) => {
        console.log(error.response.data);
      });
    const newAccessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;
    user.coinbaseToken = newAccessToken;
    user.coinbaseRefreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({ message: "Refresh token updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.coinbaseCallback = async (req, res) => {
  const code = req.query.code;
  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://api.coinbase.com/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.COINBASE_CLIENT_ID,
        client_secret: process.env.COINBASE_CLIENT_SECRET,
        redirect_uri: process.env.COINBASE_REDIRECT_URI,
      }
    );
    const { access_token, refresh_token } = tokenResponse.data;

    // Fetch user profile information
    const profileResponse = await axios.get(
      "https://api.coinbase.com/v2/user",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { id, name, avatar_url } = profileResponse.data.data;

    // console.log(profileResponse.data.data);
    // Check if user exists, if not, create one
    let user = await User.findOne({ username: id });
    if (!user) {
      user = new User({
        username: id,
        coinbaseId: id,
        name,
        avatar_url,
        coinbaseToken: access_token,
        coinbaseRefreshToken: refresh_token,
      });
      await user.save();
    }

    // Generate a JWT token for the session
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "6h",
      }
    );

    // Send the token to the frontend
    res.status(200).json({
      token,
      name: user.name,
      avatar_url: user.avatar_url,
      role: user.role,
      profile: profileResponse.data.data,
    });
    user.coinbaseToken = access_token;
    user.coinbaseRefreshToken = refresh_token;
    user.save();
  } catch (error) {
    console.error("Coinbase Callback Error:", error);
    res.status(500).send("Authentication failed.");
  }
};
