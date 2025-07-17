import { ethers } from 'ethers';
import { getProvider, getContract } from './blockchain.js';
import { showSlippageWarning } from './utils.js';
import { startBalanceListener } from './wallet.js';

const dexContractAddress = "0x..."; // 填入你的合约地址
const dexABI = [...]; // 从/contracts/artifacts获取ABI

// 初始化DEX功能
export function initDEX() {
    document.getElementById('swap-btn').addEventListener('click', handleSwap);
}

// 处理交易请求
async function handleSwap() {
    const tokenIn = document.getElementById('token-in').value;
    const tokenOut = document.getElementById('token-out').value;
    const amountIn = parseFloat(document.getElementById('amount-in').value);
    const slippage = parseFloat(document.getElementById('slippage').value) || 0.5;
    
    // 获取最小输出量
    const minAmountOut = await calculateMinAmountOut(tokenIn, tokenOut, amountIn, slippage);
    
    // 执行交易
    const success = await executeSwap(tokenIn, tokenOut, amountIn, minAmountOut, slippage);
    
    if (success) {
        alert('交易成功!');
    }
}

// 执行实际交易
export async function executeSwap(tokenIn, tokenOut, amountIn, minAmountOut, slippage) {
    try {
        const provider = getProvider();
        const signer = provider.getSigner();
        const dexContract = getContract(dexContractAddress, dexABI, signer);
        
        // 获取用户地址
        const userAddress = await signer.getAddress();
        
        // 检查滑点风险
        const expectedAmountOut = await calculateExpectedOutput(tokenIn, tokenOut, amountIn);
        const slippageCheck = checkSlippage(expectedAmountOut, minAmountOut, slippage);
        
        if (slippageCheck.warning) {
            showSlippageWarning(slippageCheck.message);
            const proceed = confirm(`${slippageCheck.message}\n是否继续交易?`);
            if (!proceed) return false;
        }

        // 执行交易
        const tx = await dexContract.swap(
            tokenIn,
            tokenOut,
            ethers.utils.parseUnits(amountIn.toString(), 18),
            ethers.utils.parseUnits(minAmountOut.toString(), 18),
            { gasLimit: 500000 }
        );
        
        await tx.wait();
        
        // 更新UI
        startBalanceListener(userAddress);
        updateTransactionHistory();
        
        return true;
    } catch (error) {
        console.error("交易失败:", error);
        alert(`交易失败: ${error.message}`);
        return false;
    }
}

// 计算预期输出
async function calculateExpectedOutput(tokenIn, tokenOut, amountIn) {
    const provider = getProvider();
    const dexContract = getContract(dexContractAddress, dexABI, provider);
    
    const amountOut = await dexContract.getAmountOut(
        tokenIn,
        tokenOut,
        ethers.utils.parseUnits(amountIn.toString(), 18)
    );
    
    return parseFloat(ethers.utils.formatUnits(amountOut, 18));
}

// 计算带滑点的最小输出
async function calculateMinAmountOut(tokenIn, tokenOut, amountIn, slippage) {
    const expected = await calculateExpectedOutput(tokenIn, tokenOut, amountIn);
    return expected * (1 - slippage / 100);
}

// 初始化DEX模块
document.addEventListener('DOMContentLoaded', initDEX);