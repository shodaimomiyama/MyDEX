import { expect } from "chai";
import { ethers } from "hardhat";
import type { ContractFactory, Contract } from "ethers"; //import type:クラスの機能は使わないが、型の情報だけ使いたい時に便利。

const TEST_ADDRESSES: [string, string] = [
    '0x1230000000000000000000000000000000000000',
    '0x3456000000000000000000000000000000000000'
]

describe("UdexFactory", function () {
    it("get no pool address before creation", async function () {
        const Factory: ContractFactory = await ethers.getContractFactory("UdexFactory");
        const factory: Contract = await Factory.deploy();
        await factory.deployed();
        expect(await factory.getPool(...TEST_ADDRESSES)).to.eq(ethers.constants.AddressZero); //...（スプレッドシンタックス）:TEST_ADDRESSESの引数を一つずつ渡す。

    })
})