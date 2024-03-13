import { expect } from "chai";
import { ethers } from "hardhat";
import type { ContractFactory, Contract } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ERC777 example", function () {
    it("send token to a registered recipient", async function () {
        const [account0] = await ethers.getSigners();

        // ERC777 token
        const Token: ContractFactory = await ethers.getContractFactory("ERC777Test");
        const token: Contract = await Token.deploy("ERC777Token", "777", 1000000, []);
        await token.deployed();
        expect(await token.balanceOf(account0.address)).to.eq(1000000);

        // ERC777 recipient
        const Recipient: ContractFactory = await ethers.getContractFactory("ERC777RecipientTest");
        const recipient: Contract = await Recipient.deploy();
        await recipient.deployed();

        // token sent to recipient and hook tokenReceived called
        await expect(token.transfer(recipient.address, 12345))
            .to.emit(recipient, "TokenReceived")
            .withArgs(account0.address, account0.address, recipient.address, 12345);
    })
})