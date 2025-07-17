import { ethers } from 'ethers';
import { showLoader, hideLoader, updateLiquidityUI } from './ui';
import { formatUnits, parseUnits } from './utils';

class LiquidityManager {
  constructor() {
    this.poolContract = null;
    this.stakingContract = null;
    this.userAddress = null;
  }

  async init() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = provider.getSigner();
    this.userAddress = await this.signer.getAddress();
    
    // 加载合约ABI
    const poolAbi = await import('./abis/LiquidityPool.json');
    const stakingAbi = await import('./abis/StakingRewards.json');
    
    // 合约地址
    const poolAddress = "0xabcd...ef01";
    const stakingAddress = "0x5678...90ab";
    
    this.poolContract = new ethers.Contract(poolAddress, poolAbi, this.signer);
    this.stakingContract = new ethers.Contract(stakingAddress, stakingAbi, this.signer);
    
    this.loadLiquidityData();
  }

  async loadLiquidityData() {
    showLoader('Loading liquidity data...');
    
    try {
      // 获取池信息
      const [totalLiquidity, userLiquidity, userStaked, rewards] = await Promise.all([
        this.poolContract.totalLiquidity(),
        this.poolContract.userLiquidity(this.userAddress),
        this.stakingContract.balanceOf(this.userAddress),
        this.stakingContract.earned(this.userAddress)
      ]);
      
      // 更新UI
      updateLiquidityUI({
        totalLiquidity: formatUnits(totalLiquidity),
        userLiquidity: formatUnits(userLiquidity),
        userStaked: formatUnits(userStaked),
        rewards: formatUnits(rewards)
      });
      
      hideLoader();
    } catch (error) {
      hideLoader();
      console.error('Failed to load liquidity data:', error);
    }
  }

  async addLiquidity(tokenA, tokenB, amountA, amountB) {
    try {
      showLoader('Adding liquidity...');
      
      // 批准代币
      await this.approveToken(tokenA, amountA);
      await this.approveToken(tokenB, amountB);
      
      // 添加流动性
      const tx = await this.poolContract.addLiquidity(
        tokenA,
        tokenB,
        parseUnits(amountA),
        parseUnits(amountB),
        0, // 最小数量（前端计算）
        0,
        this.userAddress,
        Math.floor(Date.now() / 1000) + 600
      );
      
      const receipt = await tx.wait();
      this.loadLiquidityData();
      return receipt;
    } catch (error) {
      hideLoader();
      console.error('Add liquidity failed:', error);
      throw error;
    }
  }

  async stakeLiquidity(amount) {
    try {
      showLoader('Staking liquidity...');
      
      // 批准LP代币
      const lpTokenAddress = await this.poolContract.pairToken();
      await this.approveToken(lpTokenAddress, amount);
      
      // 质押
      const tx = await this.stakingContract.stake(parseUnits(amount));
      const receipt = await tx.wait();
      this.loadLiquidityData();
      return receipt;
    } catch (error) {
      hideLoader();
      console.error('Stake failed:', error);
      throw error;
    }
  }

  async claimRewards() {
    try {
      showLoader('Claiming rewards...');
      const tx = await this.stakingContract.getReward();
      const receipt = await tx.wait();
      this.loadLiquidityData();
      return receipt;
    } catch (error) {
      hideLoader();
      console.error('Claim rewards failed:', error);
      throw error;
    }
  }

  async approveToken(tokenAddress, amount) {
    const tokenAbi = [...]; // ERC20 ABI
    const token = new ethers.Contract(tokenAddress, tokenAbi, this.signer);
    
    const allowance = await token.allowance(this.userAddress, this.poolContract.address);
    if (allowance.lt(parseUnits(amount))) {
      const tx = await token.approve(this.poolContract.address, parseUnits(amount));
      await tx.wait();
    }
  }
}

export default new LiquidityManager();