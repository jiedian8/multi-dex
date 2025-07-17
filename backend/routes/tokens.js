const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Token = require('../models/Token');

// 获取所有代币
router.get('/', auth, async (req, res) => {
  try {
    const tokens = await Token.find().sort({ liquidity: -1 });
    res.json(tokens);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// 添加新代币
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('symbol', 'Symbol is required').not().isEmpty(),
      check('chain', 'Chain is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, symbol, chain, contractAddress, liquidity } = req.body;
    
    try {
      const newToken = new Token({
        name,
        symbol,
        chain,
        contractAddress,
        liquidity: liquidity || 0
      });
      
      const token = await newToken.save();
      res.json(token);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// 更新代币状态
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  
  try {
    const token = await Token.findById(req.params.id);
    if (!token) return res.status(404).json({ msg: 'Token not found' });
    
    token.status = status;
    await token.save();
    
    res.json(token);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Token not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;