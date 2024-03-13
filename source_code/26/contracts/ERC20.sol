// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract ERC20 {
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    address private _owner;
    mapping(address => uint256) private _balances;

    constructor (string memory name_, string memory symbol_, uint8 decimals_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _owner = msg.sender;
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function decimals() external view returns (uint8) {
        return _decimals;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function mint(address account, uint256 amount) external {
        require(msg.sender == _owner, "only contract owner can call mint");
        require(account != address(0), "mint to the zero address is not allowed");
        _totalSupply = _totalSupply + amount;
        _balances[account] = _balances[account] + amount;
    }

    function burn(address account, uint256 amount) external {
        require(msg.sender == _owner, "only contract owner can call burn");
        require(account != address(0), "burn from the zero address is not allowed");
        _balances[account] = _balances[account] - amount;
        _totalSupply = _totalSupply - amount;
    }

}

