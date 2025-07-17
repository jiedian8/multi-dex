const { Web3 } = require('web3');
const Contract = require('../contracts/MultiDEX.json');

class BlockchainService {
  constructor() {
    this.web3 = new Web3(process.env.ETH_NODE_URL);
    this.contract = new this.web3.eth.Contract(
      Contract.abi,
      process.env.CONTRACT_ADDRESS
    );
  }
  
  // 执行交换
  async executeSwap(userAddress, tokenIn, tokenOut, amountIn) {
    const data = this.contract.methods
      .swap(tokenIn, tokenOut, amountIn)
      .encodeABI();
      
    return this.sendTransaction(userAddress, data);
  }
  
  // 添加流动性
  async addLiquidity(userAddress, tokenA, tokenB, amountA, amountB) {
    const data = this.contract.methods
      .addLiquidity(tokenA, tokenB, amountA, amountB)
      .encodeABI();
      
    return this.sendTransaction(userAddress, data);
  }
  
  // 发送交易
  async sendTransaction(userAddress, data) {
    const txCount = await this.web3.eth.getTransactionCount(userAddress);
    
    const txObject = {
      nonce: this.web3.utils.toHex(txCount),
      to: process.env.CONTRACT_ADDRESS,
      value: '0x0',
      gasLimit: this.web3.utils.toHex(300000),
      gasPrice: this.web3.utils.toHex(await this.web3.eth.getGasPrice()),
      data: data
    };
    
    return txObject;
  }
  
  // 监听合约事件
  startEventListeners() {
    this.contract.events.Swap({})
      .on('data', event => this.handleSwapEvent(event))
      .on('error', error => console.error('Swap event error:', error));
      
    this.contract.events.LiquidityAdded({})
      .on('data', event => this.handleLiquidityEvent(event))
      .on('error', error => console.error('Liquidity event error:', error));
  }
  
  handleSwapEvent(event) {
    const { user, tokenIn, tokenOut, amountIn, amountOut } = event.returnValues;
    console.log(`Swap: ${user} swapped ${amountIn} ${tokenIn} to ${amountOut} ${tokenOut}`);
    // 更新数据库交易记录
  }
  
  handleLiquidityEvent(event) {
    const { provider, tokenA, tokenB, amountA, amountB } = event.returnValues;
    console.log(`Liquidity: ${provider} added ${amountA} ${tokenA} and ${amountB} ${tokenB}`);
    // 更新数据库流动性池
  }
}

module.exports = new BlockchainService();