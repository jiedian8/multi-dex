const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    txHash: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    tokenIn: { 
        type: String, 
        required: true 
    },
    tokenOut: { 
        type: String, 
        required: true 
    },
    amountIn: { 
        type: Number, 
        required: true 
    },
    amountOut: { 
        type: Number, 
        required: true 
    },
    slippage: {
        type: Number,
        default: 0
    },
    network: {
        type: String,
        default: 'BSC'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    completedAt: Date
});

// 添加索引以加速查询
TransactionSchema.index({ user: 1, timestamp: -1 });
TransactionSchema.index({ tokenIn: 1, tokenOut: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);