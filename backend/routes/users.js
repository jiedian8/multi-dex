const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateAdmin } = require('../middleware/auth');

// 获取所有用户
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取用户详情
router.get('/:id', authenticateAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: '用户未找到' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 更新用户状态
router.put('/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: req.body.isActive },
            { new: true }
        ).select('-password');
        
        if (!user) return res.status(404).json({ message: '用户未找到' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;