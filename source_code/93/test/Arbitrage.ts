import { expect } from "chai";
import { ethers, network } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { ContractFactory, Contract, Signer } from "ethers";
import IERC20 from "../artifacts/contracts/interfaces/IERC20.sol/IERC20.json";
import IUdexRouter from "../artifacts/contracts/interfaces/IUdexRouter.sol/IUdexRouter.json";
import IUdexFactory from "../artifacts/contracts/interfaces/IUdexFactory.sol/IUdexFactory.json";
import { tokenData, udexAddress, aaveAddress } from "./constants.ts";
import { getRichSigner, setupPool } from "./utils.ts";

describe("Arbitrage", function () {
    async function deployPoolsFixture() {
        const [owner]: Signer[] = await ethers.getSigners();
        const rich: Signer = await getRichSigner();

        // No Pool exists
        const factory = new ethers.Contract(udexAddress.factory, IUdexFactory.abi, ethers.provider);
        expect(await factory.getPool(tokenData.wbtc.address, tokenData.usdc.address)).to.equal(ethers.constants.AddressZero);
        expect(await factory.getPool(tokenData.wbtc.address, tokenData.dai.address)).to.equal(ethers.constants.AddressZero);
        expect(await factory.getPool(tokenData.usdc.address, tokenData.dai.address)).to.equal(ethers.constants.AddressZero);

        // Setup Pools
        expect((tokenData.wbtc.address < tokenData.usdc.address) && (tokenData.usdc.address < tokenData.dai.address)).to.equal(true)
        await setupPool(
            [tokenData.wbtc.address, tokenData.usdc.address],
            [tokenData.wbtc.decimals, tokenData.usdc.decimals],
            ['5', '90000'], // 1 BTC = 18000 USD
            rich
        );
        await setupPool(
            [tokenData.wbtc.address, tokenData.dai.address], 
            [tokenData.wbtc.decimals, tokenData.dai.decimals],
            ['5', '120000'],  // 1 BTC = 24000 USD
            rich
        );
        await setupPool(
            [tokenData.usdc.address, tokenData.dai.address], 
            [tokenData.usdc.decimals, tokenData.dai.decimals],
            ['10000', '10000'],
            rich
        );
        
        // Flash Loan Contract (owned by owner account)
        const Arbitrage: ContractFactory = await ethers.getContractFactory("Arbitrage");
        const flashloan: Contract = await Arbitrage.deploy(aaveAddress.poolAddressesProvider, udexAddress.router);
        await flashloan.deployed();

        // Zero USDC balance before swaps
        const usdc: Contract = new ethers.Contract(tokenData.usdc.address, IERC20.abi, ethers.provider);
        expect(await usdc.balanceOf(flashloan.address)).to.eq(0);
        return { flashloan, usdc }
    }

    it("run flash loan arbitrage: USDC -> WBTC -> DAI -> USDC", async function () {
        const { flashloan, usdc } = await loadFixture(deployPoolsFixture);

        const borrowAmount = 1000;  // 1000 USDC
        const tx = await flashloan.requestFlashLoan(
            usdc.address, tokenData.wbtc.address, tokenData.dai.address,
            ethers.utils.parseUnits(borrowAmount.toString(), tokenData.usdc.decimals)
        )

        // USDC balance after swap
        const usdcBalance = await usdc.balanceOf(flashloan.address);
        expect(usdcBalance).to.gt(ethers.utils.parseUnits('100', tokenData.usdc.decimals));
        console.log('USDC earned:', ethers.utils.formatUnits(usdcBalance, tokenData.usdc.decimals));
    });

    it("non profitable path: USDC -> DAI -> WBTC -> USDC", async function () {
        const { flashloan, usdc } = await loadFixture(deployPoolsFixture);

        const borrowAmount = 1000; // 1000 USDC
        await expect(flashloan.requestFlashLoan(
            usdc.address, tokenData.dai.address, tokenData.wbtc.address,
            ethers.utils.parseUnits(borrowAmount.toString(), tokenData.usdc.decimals)
        )).to.be.revertedWith("No profit")
    });        
})