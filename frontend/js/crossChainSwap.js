import { ethers } from 'ethers';
import { getRouterAddress, getBridgeAddress } from './chainConfig';

const CrossChainSwap = {
  async init() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();
    this.userAddress = await this.signer.getAddress();
  },

  async executeSwap(sourceChain, destChain, tokenIn, tokenOut, amount, slippage = 0.5) {
    const contractAddress = '0x8a4d...C3f1'; // 实际合约地址
    const abi = [...]; // CrossChainSwap ABI
    
    const contract = new ethers.Contract(contractAddress, abi, this.signer);
    const sourceChainId = this.getChainId(sourceChain);
    const destChainId = this.getChainId(destChain);
    
    // 计算最小输出量（考虑滑点）
    const expectedAmount = await this.getExpectedAmount(sourceChainId, tokenIn, tokenOut, amount);
    const minAmountOut = expectedAmount.mul(100 - slippage).div(100);
    
    // 设置交易截止时间（10分钟后）
    const deadline = Math.floor(Date.now() / 1000) + 600;
    
    try {
      const tx = await contract.executeCrossChainSwap(
        sourceChainId,
        destChainId,
        tokenIn,
        tokenOut,
        amount,
        minAmountOut,
        deadline
      );
      
      return tx.wait();
    } catch (error) {
      console.error('Cross-chain swap failed:', error);
      throw new Error(`Swap failed: ${error.message}`);
    }
  },

  async getExpectedAmount(chainId, tokenIn, tokenOut, amount) {
    const routerAddress = getRouterAddress(chainId);
    const router = new ethers.Contract(routerAddress, [...], this.provider); // Router ABI
    
    const path = [tokenIn, tokenOut];
    const amounts = await router.getAmountsOut(amount, path);
    return amounts[1];
  },

  getChainId(networkName) {
    const chains = {
      'bsc': 56,
      'polygon': 137,
      'bsc-testnet': 97,
      'mumbai': 80001
    };
    return chains[networkName.toLowerCase()] || 0;
  },

  // 滑点风险提示
  showSlippageWarning(expected, min) {
    const slippage = ((expected - min) / expected * 100).toFixed(2);
    return confirm(`⚠️ High Slippage Risk! 
Expected: ${expected}
Minimum: ${min} (${slippage}% slippage)
Proceed with swap?`);
  }
};

export default CrossChainSwap;