// backend/services/market.js
const axios = require('axios');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

async function getTokenPrice(tokenId) {
    try {
        const response = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: tokenId,
                vs_currencies: 'usd'
            }
        });
        return response.data[tokenId].usd;
    } catch (error) {
        console.error('CoinGecko API 错误:', error);
        return null;
    }
}

async function updateTokenPrices() {
    const tokens = await Token.find();
    for (const token of tokens) {
        if (token.coingeckoId) {
            const price = await getTokenPrice(token.coingeckoId);
            if (price) {
                token.priceUSD = price;
                await token.save();
            }
        }
    }
}

// 每小时更新一次价格
setInterval(updateTokenPrices, 3600000);