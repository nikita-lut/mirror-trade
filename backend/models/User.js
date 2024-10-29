const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String },
  avatar_url: { type: String },
  // password: {
  //   type: String,
  //   required: true,
  //   minlength: 6, // Minimum password length
  // },
  role: { type: String, required: false, default: "user" },
  mainAccount: { type: String },
  coinbaseToken: { type: String, required: false }, // Token for Coinbase API access
  coinbaseRefreshToken: { type: String, required: false },
  coinbaseId: { type: String, unique: true },
  usdcBalance: { type: Number, default: 0 },
  holdings: { type: Array, default: [] }, // Store coin holdings as an object Array
  profitLoss: { type: Number, default: 0 },
  fund: { type: Number, default: 0 },
  totalFund: { type: Number, default: 0 },
  allocations: { type: Object, default: {} },
});

// Hash the password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next(); // Only hash if password is modified
//   this.password = await bcrypt.hash(this.password, 10); // Hash the password
//   next();
// });

// // Compare password method
// userSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password); // Compare hashed password
// };

const User = mongoose.model("User", userSchema);
module.exports = User;
