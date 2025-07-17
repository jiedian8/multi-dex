const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/db');
const User = require('../models/User');

// 管理员登录
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 查找管理员用户
    const user = await User.findOne({ username, role: 'admin' });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    
    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    
    // 创建JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      config.secret,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;