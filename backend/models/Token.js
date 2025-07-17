const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        index: true
    },
    symbol: { 
        type: String, 
        required: true, 
        unique: true,
        uppercase: true
    },
    address: { 
        type: String, 
        required: true,
        index: true
    },
    chainId: { 
        type: Number, 
        required: true,
        default: 56 // BSC主网ID
    },
    decimals: { 
        type: Number, 
        default: 18 
    },
    priceUSD: { 
        type: Number 
    },
    liquidity: { 
        type: Number 
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// 自动更新最后更新时间戳
TokenSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

module.exports = mongoose.model('Token', TokenSchema);