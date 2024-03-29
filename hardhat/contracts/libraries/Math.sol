// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

//libraryは単体ではデプロイできない。
library Math {
    function min(uint x, uint y) internal pure returns (uint z) {
        //internal:このlibraryはこれを呼び出しているコントラクトの中に、コードとして埋め込まれてデプロイされるのでinternal
        //pure:入力だけから出力が計算される。つまり、StateVariableのような無オブ状態を暗に読み書きしない。
        z = x < y ? x : y;
    }

    function sqrt(uint y) internal pure returns (uint z) {
        //バビロニア法

        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
