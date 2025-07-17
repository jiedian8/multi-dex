import { ethers } from 'ethers';
import WalletConnectProvider from "@walletconnect/web3-provider";

// 区块链服务单例
class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = "0x..."; // 部署后替换为实际地址
    this.contractABI = [...]; // 合约ABI
  }

  // 初始化钱包连接
  async initWallet() {
    const provider = new WalletConnectProvider({
      rpc: {
        1: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
        3: "https://ropsten.infura.io/v3/YOUR_INFURA_KEY",
        56: "https://bsc-dataseed.binance.org/",
        137: "https://polygon-rpc.com/"
      }
    });
    
    await provider.enable();
    this.provider = new ethers.providers.Web3Provider(provider);
    this.signer = this.provider.getSigner();
    
    // 初始化合约实例
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.contractABI,
      this.signer
    );
    
    return this.getAccount();
  }

  // 获取当前账户
  async getAccount() {
    const accounts = await this.provider.listAccounts();
    return accounts[0] || null;
  }

  // 执行交换
  async swap(tokenIn, tokenOut, amountIn) {
    const tx = await this.contract.swap(
      tokenIn,
      tokenOut,
      ethers.utils.parseUnits(amountIn.toString(), 18)
    );
    
    const receipt = await tx.wait();
    return receipt;
  }

  // 添加流动性
  async addLiquidity(tokenA, tokenB, amountA, amountB) {
    const tx = await this.contract.addLiquidity(
      tokenA,
      tokenB,
      ethers.utils.parseUnits(amountA.toString(), 18),
      ethers.utils.parseUnits(amountB.toString(), 18)
    );
    
    const receipt = await tx.wait();
    return receipt;
  }

  // 获取池子信息
  async getPoolInfo(tokenA, tokenB) {
    const poolId = ethers.utils.solidityKeccak256(
      ["address", "address"],
      [tokenA, tokenB]
    );
    
    return await this.contract.pools(poolId);
  }
}

// 导出单例实例
export default new BlockchainService();