// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CrossChainSwap is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    struct ChainConfig {
        address router;
        bool supported;
    }
    
    mapping(uint256 => ChainConfig) public chainConfigs;
    address public bridgeContract;
    uint256 public maxSlippage = 500; // 5%
    
    event SwapExecuted(
        address indexed user,
        uint256 sourceChainId,
        uint256 destChainId,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    modifier onlySupportedChain(uint256 chainId) {
        require(chainConfigs[chainId].supported, "Chain not supported");
        _;
    }
    
    constructor(address _bridge) {
        bridgeContract = _bridge;
        _transferOwnership(msg.sender);
        
        // 初始化链配置
        chainConfigs[56] = ChainConfig(0x10ED43C718714eb63d5aA57B78B54704E256024E, true); // BSC
        chainConfigs[137] = ChainConfig(0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff, true); // Polygon
    }
    
    function setBridge(address _bridge) external onlyOwner {
        require(_bridge != address(0), "Invalid address");
        bridgeContract = _bridge;
    }
    
    function setChainConfig(
        uint256 chainId, 
        address router, 
        bool supported
    ) external onlyOwner {
        chainConfigs[chainId] = ChainConfig(router, supported);
    }
    
    function setMaxSlippage(uint256 slippage) external onlyOwner {
        require(slippage <= 1000, "Slippage too high"); // Max 10%
        maxSlippage = slippage;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function executeCrossChainSwap(
        uint256 sourceChainId,
        uint256 destChainId,
        address tokenIn,
        address tokenOut,
        uint256 amount,
        uint256 minAmountOut,
        uint256 deadline
    ) external nonReentrant whenNotPaused {
        require(block.timestamp <= deadline, "Transaction expired");
        require(minAmountOut > 0, "Invalid min amount");
        
        // 验证滑点
        uint256 expectedAmount = getExpectedAmount(sourceChainId, tokenIn, tokenOut, amount);
        uint256 slippage = ((expectedAmount - minAmountOut) * 10000) / expectedAmount;
        require(slippage <= maxSlippage, "Slippage too high");
        
        // 转移代币
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amount);
        
        // 批准路由器
        IERC20(tokenIn).safeApprove(chainConfigs[sourceChainId].router, amount);
        
        // 执行交换
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        IUniswapV2Router router = IUniswapV2Router(chainConfigs[sourceChainId].router);
        uint[] memory amounts = router.swapExactTokensForTokens(
            amount,
            minAmountOut,
            path,
            address(this),
            deadline
        );
        
        uint256 amountOut = amounts[1];
        
        // 跨链桥接
        IERC20(tokenOut).safeApprove(bridgeContract, amountOut);
        ICrossChainBridge(bridgeContract).bridgeTokens(
            tokenOut,
            amountOut,
            destChainId,
            msg.sender
        );
        
        emit SwapExecuted(
            msg.sender,
            sourceChainId,
            destChainId,
            tokenIn,
            tokenOut,
            amount,
            amountOut
        );
    }
    
    function getExpectedAmount(
        uint256 chainId,
        address tokenIn,
        address tokenOut,
        uint256 amount
    ) public view returns (uint256) {
        IUniswapV2Router router = IUniswapV2Router(chainConfigs[chainId].router);
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        uint[] memory amounts = router.getAmountsOut(amount, path);
        return amounts[1];
    }
    
    // 安全功能：提取意外发送的代币
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] memory path) 
        external 
        view 
        returns (uint[] memory amounts);
}

interface ICrossChainBridge {
    function bridgeTokens(
        address token,
        uint256 amount,
        uint256 destChainId,
        address recipient
    ) external;
}