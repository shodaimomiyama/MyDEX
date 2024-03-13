// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { FlashLoanSimpleReceiverBase } from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import { IPoolAddressesProvider } from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import { IERC20 } from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import { IUdexRouter } from "./interfaces/IUdexRouter.sol";

contract Arbitrage is FlashLoanSimpleReceiverBase {
    address immutable owner;
    address immutable router;

    constructor(address _addressProvider, address _router) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
        owner = msg.sender;
        router = _router;
    }

    function swap(address tokenIn, address tokenOut, uint amountIn) internal returns (uint amountOut) {
        IERC20(tokenIn).approve(router, amountIn);
        amountOut = IUdexRouter(router).swapTokenPair(tokenIn, tokenOut, amountIn, 0, address(this), block.timestamp);
    }

    function executeOperation(
        address asset,
        uint amount,
        uint premium,
        address /* initiator */,
        bytes calldata params
    ) external override returns (bool) {
        uint beforeBalance = IERC20(asset).balanceOf(address(this));
        (address token1, address token2) = abi.decode(params, (address, address));
        uint amount1 = swap(asset, token1, amount);
        uint amount2 = swap(token1, token2, amount1);
        swap(token2, asset, amount2);

        uint afterBalance = IERC20(asset).balanceOf(address(this));
        uint amountOwed = amount + premium;
        // afterBalance - amountOwed > beforeBalance - amount
        require(afterBalance + amount > beforeBalance + amountOwed, "No profit");

        IERC20(asset).approve(address(POOL), amountOwed);
        return true;
    }
    
    function requestFlashLoan(address token0, address token1, address token2, uint amount0) public {
        require(msg.sender == owner, "Only contract owner can call requestFlashLoan");
        address receiverAddress = address(this);        
        bytes memory params = abi.encode(token1, token2);
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            token0,
            amount0,
            params,
            referralCode
        );
    }

    function withdraw(address _tokenAddress) external {
        require(msg.sender == owner, "Only contract owner can withdraw");
        IERC20 token = IERC20(_tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}