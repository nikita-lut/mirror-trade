const axios = require('axios');

const getCoinbaseBalance = async (apiKey, apiSecret) => {
    const response = await axios.get('https://api.coinbase.com/v2/accounts', {
        headers: {
            'CB-ACCESS-KEY': apiKey,
            'CB-ACCESS-SIGN': apiSecret,
        }
    });
    return response.data;
};

module.exports = { getCoinbaseBalance };