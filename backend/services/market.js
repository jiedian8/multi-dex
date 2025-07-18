const axios = require('axios');
const Token = require('../models/Token');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

class MarketService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async getTokenPrice(tokenId) {
        try {
            const response = await axios.get(`${COINGECKO_API}/simple/price`, {
                params: {
                    ids: tokenId,
                    vs_currencies: 'usd',
                    x_cg_pro_api_key: this.apiKey
                },
                timeout: 5000
            });
            return response.data[tokenId]?.usd || null;
        } catch (error) {
            console.error('CoinGecko API error:', error.response?.data || error.message);
            return null;
        }
    }

    async updateTokenPrices() {
        try {
            const tokens = await Token.find({ coingeckoId: { $exists: true } });
            const updatePromises = tokens.map(async token => {
                const price = await this.getTokenPrice(token.coingeckoId);
                if (price !== null && price !== token.priceUSD) {
                    token.priceUSD = price;
                    await token.save();
                    console.log(`Updated ${token.symbol} price: $${price}`);
                }
            });
            
            await Promise.all(updatePromises);
            return { updated: updatePromises.length };
        } catch (error) {
            console.error('Price update failed:', error);
            throw error;
        }
    }
}

// 初始化服务
if (process.env.COINGECKO_API_KEY) {
    const marketService = new MarketService(process.env.COINGECKO_API_KEY);
    
    // 定时任务（每小时运行）
    setInterval(() => {
        marketService.updateTokenPrices()
            .catch(e => console.error('Scheduled price update failed:', e));
    }, 3600000);
    
    // 立即执行一次
    marketService.updateTokenPrices();
} else {
    console.warn('CoinGecko API key not set. Market data service disabled.');
}