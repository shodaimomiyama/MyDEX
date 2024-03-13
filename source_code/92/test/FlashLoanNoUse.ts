import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { ContractFactory, Contract, Signer, BigNumber } from "ethers";
import { tokenData, aaveAddress } from "./constants.ts";
import { getRichSigner } from "./utils.ts";
import IERC20 from "../artifacts/contracts/interfaces/IERC20.sol/IERC20.json";

describe("FlashLoanNoUse", function () {
    async function deployFixture() {
        const [owner, account1]: Signer[] = await ethers.getSigners();
        const rich: Signer = await getRichSigner();

        // Flash Loan Contract (owned by owner account)
        const FlashLoanNoUse: ContractFactory = await ethers.getContractFactory("FlashLoanNoUse");
        const flashloan: Contract = await FlashLoanNoUse.deploy(aaveAddress.poolAddressesProvider);
        await flashloan.deployed();

        // Add 1 USDC to FlashLoan contract
        const usdc: Contract = new ethers.Contract(tokenData.usdc.address, IERC20.abi, ethers.provider);
        const oneUSDC: BigNumber = ethers.utils.parseUnits("1", tokenData.usdc.decimals);
        await usdc.connect(rich).transfer(flashloan.address, oneUSDC);

        return { flashloan, usdc, owner, account1 }
    }
    
    it("borrow and pay it back", async function () {
        const { flashloan, usdc, owner } = await loadFixture(deployFixture);
        expect(await usdc.balanceOf(flashloan.address)).to.eq(ethers.utils.parseUnits("1", tokenData.usdc.decimals));

        const borrowAmount = 1000;  // 1000 USDC
        const tx = await flashloan.requestFlashLoan(usdc.address, ethers.utils.parseUnits(borrowAmount.toString(), tokenData.usdc.decimals));
        await tx.wait();

        const fee = 0.0005 * borrowAmount  // 0.05% = 50 cents
        expect(await usdc.balanceOf(flashloan.address)).to.eq(ethers.utils.parseUnits((1 - fee).toString(), tokenData.usdc.decimals));
    });

    it("withdraw one dollar by owner", async function () {
        const { flashloan, usdc, owner } = await loadFixture(deployFixture);
        expect(await usdc.balanceOf(owner.address)).to.eq(0);

        const tx = await flashloan.connect(owner).withdraw(usdc.address);
        await tx.wait()

        expect(await usdc.balanceOf(flashloan.address)).to.eq(0);
        expect(await usdc.balanceOf(owner.address)).to.eq(ethers.utils.parseUnits("1", tokenData.usdc.decimals));
    });

    it("revert withdraw by non-owner", async function () {
        const { flashloan, usdc, owner, account1 } = await loadFixture(deployFixture);
        await expect(flashloan.connect(account1).withdraw(usdc.address)).to.be.revertedWith("Only contract owner can withdraw");
    });        
});