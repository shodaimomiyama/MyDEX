// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract ERC777Test is ERC777 {
    constructor(string memory _name, string memory _symbol, uint256 initialSupply, address[] memory defaultOperators)
        ERC777(_name, _symbol, defaultOperators) {
        _mint(msg.sender, initialSupply, "", "");
    }
}