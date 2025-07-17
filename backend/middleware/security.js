const axios = require('axios');

// 交易风险检查中间件
const tradeRiskCheck = async (req, res, next) => {
  const { tokenIn, tokenOut, amountIn, user } = req.body;
  
  try {
    // 1. 检查滑点风险
    const slippage = await calculateSlippage(tokenIn, tokenOut, amountIn);
    if (slippage > 5) { // 超过5%滑点
      return res.status(400).json({ 
        error: 'HIGH_SLIPPAGE_RISK', 
        message: `High slippage risk (${slippage.toFixed(2)}%)`,
        slippage: slippage.toFixed(2)
      });
    }
    
    // 2. 检查MEV机器人活动
    const mevRisk = await detectMEVActivity(tokenIn, tokenOut);
    if (mevRisk > 0.7) { // 高风险MEV活动
      return res.status(400).json({ 
        error: 'HIGH_MEV_ACTIVITY', 
        message: 'High MEV bot activity detected',
        riskLevel: mevRisk.toFixed(2)
      });
    }
    
    // 3. 检查可疑地址
    if (await isSuspiciousAddress(user)) {
      return res.status(400).json({ 
        error: 'SUSPICIOUS_ADDRESS', 
        message: 'Your address has been flagged as suspicious'
      });
    }
    
    next();
  } catch (error) {
    console.error('Risk check error:', error);
    res.status(500).json({ 
      error: 'RISK_ASSESSMENT_FAILED', 
      message: 'Failed to perform risk assessment'
    });
  }
};

// 计算预估滑点
async function calculateSlippage(tokenIn, tokenOut, amountIn) {
  // 这里使用模拟数据，实际应查询区块链
  const baseSlippage = 0.5; // 基础滑点0.5%
  const sizeImpact = Math.min(1, amountIn / 10000); // 每10,000美元增加1%滑点
  
  return baseSlippage + (sizeImpact * 100);
}

// 检测MEV活动
async function detectMEVActivity(tokenIn, tokenOut) {
  try {
    // 调用外部MEV检测API
    const response = await axios.get(
      `https://api.mev-inspect.com/v1/pair/${tokenIn}-${tokenOut}/risk`
    );
    
    return response.data.riskLevel || 0;
  } catch (error) {
    console.error('MEV detection failed:', error);
    return 0;
  }
}

// 检查可疑地址
async function isSuspiciousAddress(address) {
  // 这里应查询风险数据库
  const suspiciousAddresses = [
    "0x123...abc",
    "0x456...def"
  ];
  
  return suspiciousAddresses.includes(address.toLowerCase());
}

module.exports = tradeRiskCheck;