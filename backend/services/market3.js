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
            console.error('CoinGecko API 错误:', error.response?.data || error.message);
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
                    console.log(`更新 ${token.symbol} 价格: $${price}`);
                }
            });
            
            await Promise.all(updatePromises);
            return { updated: updatePromises.length };
        } catch (error) {
            console.error('价格更新失败:', error);
            throw error;
        }
    }
}

// 初始化服务
const marketService = new MarketService(process.env.COINGECKO_API_KEY);

// 定时任务（每小时运行）
setInterval(() => {
    marketService.updateTokenPrices()
        .catch(e => console.error('定时价格更新失败:', e));
}, 3600000); // 1小时

// 立即执行一次
marketService.updateTokenPrices();

module.exports = marketService;