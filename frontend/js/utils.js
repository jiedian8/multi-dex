// 滑点检查
export function checkSlippage(expectedAmount, actualAmount, maxSlippage = 0.5) {
    const slippage = ((expectedAmount - actualAmount) / expectedAmount) * 100;
    
    if (slippage > maxSlippage) {
        return {
            warning: true,
            message: `高滑点警告! 预期: ${expectedAmount.toFixed(6)} 实际: ${actualAmount.toFixed(6)} (${slippage.toFixed(2)}%)`
        };
    }
    return { warning: false };
}

// 显示滑点警告
export function showSlippageWarning(message) {
    const slippageElement = document.getElementById('slippage-warning');
    if (!slippageElement) return;
    
    slippageElement.innerHTML = `
        <div class="alert alert-warning d-flex align-items-center">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ${message}
        </div>
    `;
    slippageElement.style.display = 'block';
    
    setTimeout(() => {
        slippageElement.style.display = 'none';
    }, 10000);
}

// 格式代币金额
export function formatTokenAmount(amount, decimals = 18) {
    return parseFloat(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals
    });
}

// 获取链上代币余额
export async function getTokenBalance(tokenAddress, userAddress) {
    const provider = getProvider();
    const tokenContract = new ethers.Contract(tokenAddress, [
        "function balanceOf(address) view returns (uint256)"
    ], provider);
    
    const balance = await tokenContract.balanceOf(userAddress);
    return ethers.utils.formatUnits(balance, 18);
}