// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract CrossChainSwap is ReentrancyGuard {
    address public owner;
    IRouter public pancakeRouter; // BSC router
    IRouter public quickSwapRouter; // Polygon router
    address public bridgeContract;
    
    // 链ID到路由器的映射
    mapping(uint256 => IRouter) public chainRouters;
    
    event CrossChainSwapInitiated(
        address indexed user,
        uint256 sourceChainId,
        uint256 destChainId,
        address tokenIn,
        address tokenOut,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor(address _bscRouter, address _polygonRouter, address _bridge) {
        owner = msg.sender;
        pancakeRouter = IRouter(_bscRouter);
        quickSwapRouter = IRouter(_polygonRouter);
        bridgeContract = _bridge;
        
        // 初始化链路由器 (BSC=56, Polygon=137)
        chainRouters[56] = pancakeRouter;
        chainRouters[137] = quickSwapRouter;
    }

    function setBridge(address _newBridge) external onlyOwner {
        bridgeContract = _newBridge;
    }

    function executeCrossChainSwap(
        uint256 sourceChainId,
        uint256 destChainId,
        address tokenIn,
        address tokenOut,
        uint256 amount,
        uint256 minAmountOut,
        uint256 deadline
    ) external nonReentrant {
        require(chainRouters[sourceChainId] != IRouter(address(0)), "Unsupported source chain");
        require(chainRouters[destChainId] != IRouter(address(0)), "Unsupported dest chain");
        
        // 将代币转移到合约
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amount);
        
        // 设置交易路径
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        // 批准路由器使用代币
        IERC20(tokenIn).approve(address(chainRouters[sourceChainId]), amount);
        
        // 执行源链交换
        uint[] memory amounts = chainRouters[sourceChainId].swapExactTokensForTokens(
            amount,
            minAmountOut,
            path,
            address(this),
            deadline
        );
        
        // 跨链桥接逻辑
        uint256 bridgeAmount = amounts[amounts.length - 1];
        IERC20(tokenOut).approve(bridgeContract, bridgeAmount);
        (bool success, ) = bridgeContract.call(
            abi.encodeWithSignature(
                "bridgeTokens(address,uint256,uint256,address)",
                tokenOut,
                bridgeAmount,
                destChainId,
                msg.sender
            )
        );
        require(success, "Bridge transfer failed");

        emit CrossChainSwapInitiated(
            msg.sender,
            sourceChainId,
            destChainId,
            tokenIn,
            tokenOut,
            amount
        );
    }
}