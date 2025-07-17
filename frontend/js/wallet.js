import { ethers } from 'ethers';
import { updateBalanceUI } from './ui.js';

let balanceInterval;
let currentAddress = null;

// 连接钱包
export async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAddress = accounts[0];
            startBalanceListener(currentAddress);
            return currentAddress;
        } catch (error) {
            console.error("钱包连接失败:", error);
            return null;
        }
    } else {
        alert("请安装MetaMask!");
        return null;
    }
}

// 启动余额监听
export function startBalanceListener(address, interval = 10000) {
    if (balanceInterval) clearInterval(balanceInterval);
    currentAddress = address;
    
    updateBalances(); // 立即更新
    
    balanceInterval = setInterval(() => {
        updateBalances();
    }, interval);
}

// 停止余额监听
export function stopBalanceListener() {
    clearInterval(balanceInterval);
}

// 更新所有余额
async function updateBalances() {
    if (!currentAddress) return;
    
    try {
        // 1. 获取原生代币余额
        const provider = getProvider();
        const nativeBalance = await provider.getBalance(currentAddress);
        const formattedNative = ethers.utils.formatEther(nativeBalance);
        
        // 2. 获取主要代币余额
        const tokenBalances = await Promise.all([
            getTokenBalance('0x...', currentAddress), // 代币1地址
            getTokenBalance('0x...', currentAddress)  // 代币2地址
        ]);
        
        // 3. 更新UI
        updateBalanceUI({
            native: formattedNative,
            token1: tokenBalances[0],
            token2: tokenBalances[1]
        });
        
    } catch (error) {
        console.error("余额更新失败:", error);
    }
}

// 获取当前地址
export function getCurrentAddress() {
    return currentAddress;
}