const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { authenticateAdmin } = require('../middleware/auth');
const { checkTradeRisk } = require('../middleware/security');

// 获取所有交易
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const transactions = await Transaction.find()
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'username email');
            
        const count = await Transaction.countDocuments();
        
        res.json({
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取可疑交易
router.get('/suspicious', authenticateAdmin, async (req, res) => {
    try {
        // 查找金额超过1000或滑点超过10%的交易
        const transactions = await Transaction.find({
            $or: [
                { amountIn: { $gt: 1000 } },
                { amountOut: { $gt: 1000 } },
                { slippage: { $gt: 10 } }
            ]
        }).sort({ timestamp: -1 }).limit(100);
        
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;