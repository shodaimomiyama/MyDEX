// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract UdexPool {
    address immutable public factory;
    address public token0;
    address public token1;

    constructor() {
        factory = msg.sender;
    }

    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, 'UdexPool: INITIALIZATION_FORBIDDEN');
        token0 = _token0;
        token1 = _token1;
    }
}