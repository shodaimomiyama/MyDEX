import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import UdexPool from '../artifacts/contracts/UdexPool.sol/UdexPool.json';
import type { ContractFactory, Contract } from "ethers";

describe("Attack Scenario", function () {
    async function deployPoolFixture() {
        const [rich, attacker] = await ethers.getSigners();

        // ERC20 token
        const TokenA = await ethers.getContractFactory("TokenTest");
        const tokenA = await TokenA.deploy("ERC20Token", "A", 18, 1e9);   // 10^9
        await tokenA.deployed();
        expect(await tokenA.balanceOf(rich.address)).to.eq(1e9);

        // ERC777 token
        const TokenB: ContractFactory = await ethers.getContractFactory("ERC777Test");
        const tokenB: Contract = await TokenB.deploy("ERC777Token", "B", 1e9, []);   // 10^9
        await tokenB.deployed();
        expect(await tokenB.balanceOf(rich.address)).to.eq(1e9);

        // Deploy Udex
        const Factory = await ethers.getContractFactory("UdexFactory");
        const factory = await Factory.deploy();
        await factory.deployed();
        const Router = await ethers.getContractFactory("UdexRouter");
        const router = await Router.deploy(factory.address);
        await router.deployed();
        
        // Add Liquidity for the token pair
        const amountADesired = 1e8;
        const amountBDesired = 2 * 1e8;
        await tokenA.connect(rich).approve(router.address, amountADesired);
        await tokenB.connect(rich).approve(router.address, amountBDesired);
        const deadline = Math.floor(Date.now() / 1000) + 60;
        await router.connect(rich).addLiquidity(
            tokenA.address, tokenB.address, amountADesired, amountBDesired, 0, 0, rich.address, deadline);

        const poolAddress = await factory.getPool(tokenA.address, tokenB.address);
        const pool = new ethers.Contract(poolAddress, UdexPool.abi, rich.provider);       

        // Only rich account has liquidity token
        expect(await pool.balanceOf(rich.address)).to.equal(141420356);
        expect(await pool.balanceOf(attacker.address)).to.equal(0);   

        // Transfer tokenA, tokenB to attacker
        await tokenA.transfer(attacker.address, 1e8);
        await tokenB.transfer(attacker.address, 2 * 1e8);
        
        return { factory, router, pool, tokenA, tokenB, rich, attacker }
    }

    it("Attack using Attacker contract by attacker", async function () {
        const { factory, router, pool, tokenA, tokenB, attacker } = await loadFixture(deployPoolFixture);

        // initial balance check
        expect(await pool.balanceOf(attacker.address)).to.equal(0);
        expect(await tokenA.balanceOf(attacker.address)).to.equal(1e8);
        expect(await tokenB.balanceOf(attacker.address)).to.equal(2 * 1e8);

        // Attacker contract
        const AttackerContract: ContractFactory = await ethers.getContractFactory("Attacker");
        const attackerContract = await AttackerContract.connect(attacker).deploy(attacker.address);
        await attackerContract.deployed();
        await attackerContract.setRouter(router.address);
        await attackerContract.setPool(pool.address);

        // Deposit and send Liquidity Token to Attacker contract
        const amountADesired = 1e8;
        const amountBDesired = 2 * 1e8;
        const deadline = Math.floor(Date.now() / 1000) + 60;
        await tokenA.connect(attacker).approve(router.address, amountADesired);
        await tokenB.connect(attacker).approve(router.address, amountBDesired);
        await router.connect(attacker).addLiquidity(
            tokenA.address, tokenB.address, amountADesired, amountBDesired, 0, 0, attackerContract.address, deadline);
        expect(await pool.balanceOf(attackerContract.address)).to.eq(141421356)

        // Triger Attack
        await attackerContract.setSize(70710678);
        await tokenB.connect(attacker).transfer(attackerContract.address, 0);
        await attackerContract.connect(attacker).withdraw();

        expect(await tokenA.balanceOf(attacker.address)).to.equal(116666666);  // increased!!
        expect(await tokenB.balanceOf(attacker.address)).to.equal(2 * 1e8);
    })
});

describe("Unsuccessful Attack Scenario", function () {
    async function deployPoolFixture() {
        const [rich, attacker] = await ethers.getSigners();

        // ERC20 token
        const TokenA = await ethers.getContractFactory("TokenTest");
        const tokenA = await TokenA.deploy("ERC20Token", "A", 18, 1e9);   // 10^9
        await tokenA.deployed();
        expect(await tokenA.balanceOf(rich.address)).to.eq(1e9);

        // ERC777 token
        const TokenB: ContractFactory = await ethers.getContractFactory("ERC777Test");
        const tokenB: Contract = await TokenB.deploy("ERC777Token", "B", 1e9, []);   // 10^9
        await tokenB.deployed();
        expect(await tokenB.balanceOf(rich.address)).to.eq(1e9);

        // Deploy Udex
        const Factory = await ethers.getContractFactory("UdexFactoryV2");
        const factory = await Factory.deploy();
        await factory.deployed();
        const Router = await ethers.getContractFactory("UdexRouter");
        const router = await Router.deploy(factory.address);
        await router.deployed();

        // Add Liquidity for the token pair
        const amountADesired = 1e8;
        const amountBDesired = 2 * 1e8;
        await tokenA.connect(rich).approve(router.address, amountADesired);
        await tokenB.connect(rich).approve(router.address, amountBDesired);
        const deadline = Math.floor(Date.now() / 1000) + 60;
        await router.connect(rich).addLiquidity(
            tokenA.address, tokenB.address, amountADesired, amountBDesired, 0, 0, rich.address, deadline);

        const poolAddress = await factory.getPool(tokenA.address, tokenB.address);
        const pool = new ethers.Contract(poolAddress, UdexPool.abi, rich.provider);       

        // Only rich account has liquidity token
        expect(await pool.balanceOf(rich.address)).to.equal(141420356);
        expect(await pool.balanceOf(attacker.address)).to.equal(0);   

        // Transfer tokenA, tokenB to attacker
        await tokenA.transfer(attacker.address, 1e8);
        await tokenB.transfer(attacker.address, 2 * 1e8);

        return { factory, router, pool, tokenA, tokenB, rich, attacker }
    }

    it("Attack blocked by lock", async function () {
        const { factory, router, pool, tokenA, tokenB, attacker } = await loadFixture(deployPoolFixture);

        // initial balance check
        expect(await pool.balanceOf(attacker.address)).to.equal(0);
        expect(await tokenA.balanceOf(attacker.address)).to.equal(1e8);
        expect(await tokenB.balanceOf(attacker.address)).to.equal(2 * 1e8);

        // Attacker contract
        const AttackerContract: ContractFactory = await ethers.getContractFactory("Attacker");
        const attackerContract = await AttackerContract.connect(attacker).deploy(attacker.address);
        await attackerContract.deployed();
        await attackerContract.setRouter(router.address);
        await attackerContract.setPool(pool.address);

        // Deposit and send Liquidity Token to Attacker contract
        const amountADesired = 1e8;
        const amountBDesired = 2 * 1e8;
        const deadline = Math.floor(Date.now() / 1000) + 60;
        await tokenA.connect(attacker).approve(router.address, amountADesired);
        await tokenB.connect(attacker).approve(router.address, amountBDesired);
        await router.connect(attacker).addLiquidity(
            tokenA.address, tokenB.address, amountADesired, amountBDesired, 0, 0, attackerContract.address, deadline);
        expect(await pool.balanceOf(attackerContract.address)).to.eq(141421356);

        // Triger Attack
        await attackerContract.setSize(70710678);
        await expect(tokenB.connect(attacker).transfer(attackerContract.address, 0)).to.be.revertedWith('UdexPool: LOCKED');
    })
});
