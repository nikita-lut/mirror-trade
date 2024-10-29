// backend/server.js

const express = require("express");
const connectDB = require("./config/db"); // Import the database connection function
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/userRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");
// const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 443;
const HOST = process.env.HOST || "mirror-trade.onrender.com";
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to the database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// Serve static files from the React app build folder
// app.use(express.static(path.join(__dirname, "build")));

// Catch-all handler for any request that doesn't match the existing routes
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
