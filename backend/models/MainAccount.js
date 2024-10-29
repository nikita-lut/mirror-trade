const mongoose = require('mongoose');

const mainAccountSchema = new mongoose.Schema({
  totalUSDC: {
    type: Number,
    required: true,
  },
  allocations: {
    type: Map, // Key-value pairs for coin allocations
    of: Number,
  },
}, { timestamps: true });

const MainAccount = mongoose.model('MainAccount', mainAccountSchema);
module.exports = MainAccount;
