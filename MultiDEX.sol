// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MultiDEX is ReentrancyGuard {
    address public owner;
    uint256 public feeRate = 3; // 0.3% 交易费
    
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
    }
    
    mapping(bytes32 => Pool) public pools;
    
    event Swap(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event LiquidityAdded(
        address indexed provider,
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // 创建流动性池
    function createPool(address tokenA, address tokenB) external onlyOwner {
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        require(pools[poolId].tokenA == address(0), "Pool exists");
        
        pools[poolId] = Pool({
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: 0,
            reserveB: 0
        });
    }
    
    // 添加流动性
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant {
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        Pool storage pool = pools[poolId];
        require(pool.tokenA != address(0), "Pool not exists");
        
        // 转移代币
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);
        
        // 更新储备
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        
        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB);
    }
    
    // 执行交换
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external nonReentrant {
        bytes32 poolId = keccak256(abi.encodePacked(tokenIn, tokenOut));
        Pool storage pool = pools[poolId];
        require(pool.tokenA != address(0), "Pool not exists");
        
        // 计算输出金额（包括手续费）
        uint256 amountOut = calculateOutput(
            tokenIn == pool.tokenA ? pool.reserveA : pool.reserveB,
            tokenIn == pool.tokenA ? pool.reserveB : pool.reserveA,
            amountIn
        );
        
        // 转移代币
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        
        // 更新储备
        if (tokenIn == pool.tokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    // 计算输出金额（恒定乘积公式）
    function calculateOutput(
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 amountIn
    ) internal view returns (uint256) {
        uint256 amountInWithFee = amountIn * (1000 - feeRate);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }
}