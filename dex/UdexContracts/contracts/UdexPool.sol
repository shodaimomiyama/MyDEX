// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract UdexPool {
    address public immutable factory; //immutable:コンストラクタで値が代入されるともう変更できないことを明示
    address public token0;
    address public token1;

    constructor() {
        factory = msg.sender; //PoolContractはFactoryContractからdeployするので,msg.senderにはfactoryContractのアドレスが入っている。
    }

    function initialize(address _token0, address _token1) external {
        //factoryContractから呼び出すのでexternal
        require(msg.sender == factory, "UdexPool: INITIALIZATION_FORBIDDEN"); //msg.senderはfn initializeを読んだコントラクトアドレスもしくは、User address
        token0 = _token0;
        token1 = _token1;
    }
}
