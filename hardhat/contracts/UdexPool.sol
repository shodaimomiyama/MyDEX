// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./libraries/Math.sol";
import "./interfaces/IERC20.sol";
import "./UdexERC20.sol";

contract UdexPool is UdexERC20("Udex Token", "UDX", 18) {
    uint public constant MINIMUM_LIQUIDITY = 10 ** 3; //constantは先に値を代入していなければならない（リテラル）
    //constant:コンパイル時に決まる。デプロイ後には変更できない
    //immutable:コントラクタが呼ばれた時に値が入る。デプロイ後には変更できない
    address public immutable factory; //immutable:コンストラクタで値が代入されるともう変更できないことを明示
    address public token0;
    address public token1;
    uint public reserve0;
    uint public reserve1;

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(
        address indexed sender,
        uint amount0,
        uint amount1,
        address indexed to
    );
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    //token0が入ってきてtoken1が出る or token1が入ってきてtoken0が出る。どちらの場合も対応できるようにIn,Outのフォーマット

    constructor() {
        factory = msg.sender; //PoolContractはFactoryContractからdeployするので,msg.senderにはfactoryContractのアドレスが入っている。
    }

    function initialize(address _token0, address _token1) external {
        //factoryContractから呼び出すのでexternal
        require(msg.sender == factory, "UdexPool: INITIALIZATION_FORBIDDEN"); //msg.senderはfn initializeを読んだコントラクトアドレスもしくは、User address
        token0 = _token0;
        token1 = _token1;
    }

    //fn mintは流動性提供者のための機能
    function mint(address to) external returns (uint liquidity) {
        //流動性トークンを発行することに集中
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        uint amount0 = balance0 - reserve0;
        uint amount1 = balance1 - reserve1;

        if (_totalSupply == 0) {
            require(
                amount0 * amount1 > MINIMUM_LIQUIDITY * MINIMUM_LIQUIDITY,
                "UdexPool: BELOW_MINIMUM_LIQUIDITY"
            );
            liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY; //定数積公式より
            _mint(address(0), MINIMUM_LIQUIDITY); //MINIMUM_LIQUIDITYをaddress(0)に送ってロックすることでtotalSuuplyが0になることを防ぐ→totalSupplyでの割り算で0チェックをしなくて良い。
        } else {
            liquidity = Math.min(
                (amount0 * _totalSupply) / reserve0,
                (amount1 * _totalSupply) / reserve1
            );
        }
        require(liquidity > 0, "UdexPool: INSUFFICIENT_LIQUIDITY_MINTED");
        _mint(to, liquidity); //address(0)からのtransfer
        reserve0 = balance0;
        reserve1 = balance1;
        emit Mint(msg.sender, amount0, amount1);
    }

    //fn burnは流動性提供者のための機能
    function burn(address to) external returns (uint amount0, uint amount1) {
        IERC20 token0Contract = IERC20(token0);
        IERC20 token1Contract = IERC20(token1);

        uint balance0 = token0Contract.balanceOf(address(this)); //流動性poolが今持っているtoken0の量
        uint balance1 = token1Contract.balanceOf(address(this));
        uint liquidity = _balances[address(this)]; //このコントラクトが持っているliquidityトークンの残高

        amount0 = (liquidity * balance0) / _totalSupply;
        amount1 = (liquidity * balance1) / _totalSupply;
        require(
            amount0 > 0 && amount1 > 0,
            "UdexPool: INSUFFICIENT_LIQUIDITY_BURNED"
        );
        _burn(address(this), liquidity);
        bool success0 = token0Contract.transfer(to, amount0);
        require(success0, "UdexPool: TOKEN0_TRANSFER_FAILED");
        bool success1 = token1Contract.transfer(to, amount1);
        require(success1, "UdexPool: TOKEN1_TRANSFER_FAILED");

        reserve0 = token0Contract.balanceOf(address(this));
        reserve1 = token1Contract.balanceOf(address(this));
        emit Burn(msg.sender, amount0, amount1, to);
    }

    function swap(uint amount0Out, uint amount1Out, address to) external {
        //fn swapの引数はそれぞれswap後に引き出されるトークンの量
        require(
            amount0Out > 0 || amount1Out > 0,
            "UdexPool: INSUFFICIENT_OUTPUT_AMOUNT"
        ); //token0⇨token1ならamount0Out==0,amount1out>0。逆も然り
        require(
            amount0Out < reserve0 && amount1Out < reserve1,
            "UdexPool: INSUFFICIENT_LIQUIDITY"
        ); //出金額がPoolに入っている額よりも少ないならrevert
        require(to != token0 && to != token1, "UdexPool: INVALID_TO"); //tokenの送付先はtoken addressではない

        //流動性プールにあるトークンの残高
        //入金されるトークンはfn swapが呼ばれる前にPoolContractに呼ばれている
        //fn swap()の実装の考え方→swapして出金した後に、流動性プールに十分量のトークンが残っていればOK
        uint balance0;
        uint balance1;
        {
            //{}：スコープ→スコープ内で宣言された変数はスコープの外では見えない
            //Solidityでは一度に16こしか変数を宣言できないのでスコープを作ることで一度に見えている変数を16より少なくすることができる
            IERC20 token0Contract = IERC20(token0);
            IERC20 token1Contract = IERC20(token1);
            if (amount0Out > 0) {
                bool success0 = token0Contract.transfer(to, amount0Out);
                require(success0, "UdexPool: TOKEN0_TRANSFER_FAILED");
            }
            if (amount1Out > 1) {
                bool success1 = token1Contract.transfer(to, amount1Out);
                require(success1, "UdexPool: TOKEN1_TRANSFER_FAILED");
            }
            balance0 = token0Contract.balanceOf(address(this));
            balance1 = token1Contract.balanceOf(address(this));
        }

        uint amount0In = balance0 > reserve0 - amount0Out
            ? balance0 - (reserve0 - amount0Out)
            : 0; //入金額 = プール - 出金額
        uint amount1In = balance1 > reserve1 - amount1Out
            ? balance1 - (reserve1 - amount1Out)
            : 0;
        require(
            amount0In > 0 || amount1In > 0,
            "UdexPool: INSUFFICIENT_INPUT_AMOUNT"
        );

        // fee 0.3%
        //AMM定数積公式
        uint balance0Adjusted = (balance0 * 1000) - (amount0In * 3);
        uint balance1Adjusted = (balance1 * 1000) - (amount1In * 3);
        require(
            balance0Adjusted * balance1Adjusted >=
                reserve0 * reserve1 * 1000 ** 2,
            "UdexPool: K"
        );

        reserve0 = balance0;
        reserve1 = balance1;
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }
}
