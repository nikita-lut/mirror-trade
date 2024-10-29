const { Client } = require('coinbase');

const coinbaseClient = new Client({
  apiKey: process.env.COINBASE_API_KEY,
  apiSecret: process.env.COINBASE_API_SECRET,
});

module.exports = coinbaseClient;