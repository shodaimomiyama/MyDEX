// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import './IERC20.sol';

interface IUdexPool is IERC20 {
    function MINIMUM_LIQUIDITY() external view returns (uint);
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function reserve0() external view returns (uint);
    function reserve1() external view returns (uint);

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    
    function initialize(address _token0, address _token1) external;
    function mint(address to) external returns (uint liquidity);
    function burn(address to) external returns (uint amount0, uint amount1) ;
    function swap(uint amount0Out, uint amount1Out, address to) external;
}