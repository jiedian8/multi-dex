const { ethers } = require('ethers');
const Transaction = require('../models/Transaction');
const { getProvider } = require('./blockchain');
const logger = require('./logger');

class TransactionSync {
  constructor() {
    this.providers = {
      bsc: getProvider('bsc'),
      polygon: getProvider('polygon')
    };
    this.isSyncing = false;
    this.lastBlock = {
      bsc: 0,
      polygon: 0
    };
  }

  async start() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    
    logger.info('Starting transaction synchronization...');
    
    // 加载最后处理的区块
    const lastSync = await this.getLastSync();
    this.lastBlock = lastSync || this.lastBlock;
    
    // 开始轮询
    this.syncInterval = setInterval(() => this.syncTransactions(), 15000);
    await this.syncTransactions();
  }

  stop() {
    clearInterval(this.syncInterval);
    this.isSyncing = false;
    logger.info('Transaction synchronization stopped');
  }

  async getLastSync() {
    try {
      const result = await Transaction.findOne().sort({ blockNumber: -1 });
      if (!result) return null;
      
      return {
        bsc: result.chainId === 56 ? result.blockNumber : 0,
        polygon: result.chainId === 137 ? result.blockNumber : 0
      };
    } catch (error) {
      logger.error('Failed to get last sync:', error);
      return null;
    }
  }

  async syncTransactions() {
    try {
      logger.info('Syncing transactions...');
      
      // 同步两条链
      await Promise.all([
        this.syncChain('bsc', 56),
        this.syncChain('polygon', 137)
      ]);
      
      logger.info('Transaction sync completed');
    } catch (error) {
      logger.error('Transaction sync error:', error);
    }
  }

  async syncChain(chainName, chainId) {
    const provider = this.providers[chainName];
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = this.lastBlock[chainName] || currentBlock - 1000;
    
    // 仅同步最近的1000个区块
    const toBlock = Math.min(fromBlock + 1000, currentBlock);
    
    if (fromBlock >= toBlock) return;
    
    logger.info(`Syncing ${chainName} from block ${fromBlock} to ${toBlock}`);
    
    // 获取SwapExecuted事件
    const contractAddress = "0x8a4d...C3f1";
    const eventFilter = {
      address: contractAddress,
      topics: [
        ethers.utils.id("SwapExecuted(address,uint256,uint256,address,address,uint256,uint256)")
      ]
    };
    
    const logs = await provider.getLogs({
      ...eventFilter,
      fromBlock,
      toBlock
    });
    
    // 处理日志
    for (const log of logs) {
      const parsedLog = this.parseLog(log);
      await this.saveTransaction(parsedLog, chainId);
    }
    
    // 更新最后区块
    this.lastBlock[chainName] = toBlock + 1;
  }

  parseLog(log) {
    const iface = new ethers.utils.Interface([
      "event SwapExecuted(address indexed user, uint256 sourceChainId, uint256 destChainId, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)"
    ]);
    
    return iface.parseLog(log);
  }

  async saveTransaction(parsedLog, chainId) {
    const { args } = parsedLog;
    
    const transaction = new Transaction({
      txHash: parsedLog.transactionHash,
      user: args.user,
      sourceChainId: args.sourceChainId,
      destChainId: args.destChainId,
      tokenIn: args.tokenIn,
      tokenOut: args.tokenOut,
      amountIn: args.amountIn.toString(),
      amountOut: args.amountOut.toString(),
      chainId,
      blockNumber: parsedLog.blockNumber,
      timestamp: new Date()
    });
    
    try {
      await transaction.save();
      logger.info(`Saved transaction: ${parsedLog.transactionHash}`);
    } catch (error) {
      if (error.code !== 11000) { // 忽略重复键错误
        logger.error('Failed to save transaction:', error);
      }
    }
  }
}

module.exports = new TransactionSync();