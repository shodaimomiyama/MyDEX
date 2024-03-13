// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IUdexFactory {
    event PoolCreated(address indexed token0, address indexed token1, address pool);

    function getPool(address token0, address token1) external view returns (address pool);
    function createPool(address tokenA, address tokenB) external returns (address pool);
}