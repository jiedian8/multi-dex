const axios = require('axios');

class MarketDataService {
  constructor() {
    this.baseURL = 'https://api.coingecko.com/api/v3';
    this.cache = new Map();
  }

  async getTokenPrice(tokenId) {
    if (this.cache.has(tokenId)) {
      return this.cache.get(tokenId);
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/simple/price?ids=${tokenId}&vs_currencies=usd`
      );
      
      const price = response.data[tokenId]?.usd;
      if (price) {
        this.cache.set(tokenId, price);
        setTimeout(() => this.cache.delete(tokenId), 60000); // 1分钟缓存
      }
      
      return price || null;
    } catch (error) {
      console.error('Market data error:', error.message);
      return null;
    }
  }

  async getMarketChart(tokenId, days = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}`
      );
      
      return response.data.prices || [];
    } catch (error) {
      console.error('Market chart error:', error.message);
      return [];
    }
  }

  async getTokenInfo(tokenId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/coins/${tokenId}?tickers=false&market_data=true&community_data=false&developer_data=false`
      );
      
      return {
        id: response.data.id,
        symbol: response.data.symbol,
        name: response.data.name,
        current_price: response.data.market_data.current_price.usd,
        price_change_24h: response.data.market_data.price_change_24h,
        price_change_percentage_24h: response.data.market_data.price_change_percentage_24h,
        market_cap: response.data.market_data.market_cap.usd,
        total_volume: response.data.market_data.total_volume.usd
      };
    } catch (error) {
      console.error('Token info error:', error.message);
      return null;
    }
  }
}

module.exports = new MarketDataService();