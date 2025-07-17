import express from 'express';
import { validateChain } from '../middleware/validation';
import { getGasPrice } from '../services/blockchain';

const router = express.Router();

// 跨链风险评估端点
router.post('/crosschain-risk', validateChain, async (req, res) => {
  try {
    const { sourceChain, destChain, token, amount } = req.body;
    
    // 获取实时风险数据
    const [sourceGas, destGas, tokenVolatility] = await Promise.all([
      getGasPrice(sourceChain),
      getGasPrice(destChain),
      getTokenVolatility(token)
    ]);

    // 风险评估逻辑
    const riskScore = calculateRiskScore(
      sourceGas,
      destGas,
      tokenVolatility,
      amount
    );

    res.json({
      status: 'success',
      riskLevel: riskScore > 7 ? 'HIGH' : riskScore > 4 ? 'MEDIUM' : 'LOW',
      riskScore,
      recommendations: [
        riskScore > 7 ? 'Reduce swap amount' : null,
        sourceGas > 50 ? 'Wait for lower gas fees' : null
      ].filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Risk assessment failed'
    });
  }
});

function calculateRiskScore(gasSource, gasDest, volatility, amount) {
  // 简化风险评估算法
  let score = 0;
  
  if (gasSource > 100) score += 3;
  else if (gasSource > 50) score += 2;
  
  if (gasDest > 100) score += 3;
  else if (gasDest > 50) score += 2;
  
  if (volatility > 15) score += 4;
  else if (volatility > 7) score += 2;
  
  if (amount > 10000) score += 3;
  else if (amount > 5000) score += 1;
  
  return Math.min(10, score);
}

export default router;