import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import UdexPool from '../artifacts/contracts/UdexPool.sol/UdexPool.json';

describe("UdexPool", function () {
    async function deployPoolFixture() {
        // accounts
        const [account0, account1, account2] = await ethers.getSigners();

        // tokens
        const Token = await ethers.getContractFactory("TokenTest");
        const tokenA = await Token.deploy("tokenA", "A", 18, 1000000);
        const tokenB = await Token.deploy("tokenB", "B", 18, 1000000);
        const [token0, token1] = tokenA.address < tokenB.address ? [tokenA, tokenB] : [tokenB, tokenA];

        // Udex
        const Factory = await ethers.getContractFactory("UdexFactory");
        const factory = await Factory.deploy();
        await factory.deployed();
        await factory.createPool(token0.address, token1.address);
        const poolAddress = await factory.getPool(token0.address, token1.address);
        const pool = new ethers.Contract(poolAddress, UdexPool.abi, ethers.provider);
        return { account0, account1, account2, factory, pool, token0, token1 }
    }

    describe("state variables", function () {
        it("factory address", async function () {
            const { factory, pool } = await loadFixture(deployPoolFixture);
            expect(await pool.factory()).to.eq(factory.address);
        });

        it("token addresses", async function () {
            const { pool, token0, token1 } = await loadFixture(deployPoolFixture);
            expect(await pool.token0()).to.eq(token0.address);
            expect(await pool.token1()).to.eq(token1.address);
        });        
    });

    describe("initialize", function () {
        it("not callable by user accounts", async function () {
            const { account0, account1, account2, pool, token0, token1 } = await loadFixture(deployPoolFixture);
            await expect(pool.connect(account0).initialize(token0.address, token1.address)).to.be.revertedWith('UdexPool: INITIALIZATION_FORBIDDEN');
            await expect(pool.connect(account1).initialize(token0.address, token1.address)).to.be.revertedWith('UdexPool: INITIALIZATION_FORBIDDEN');
            await expect(pool.connect(account2).initialize(token0.address, token1.address)).to.be.revertedWith('UdexPool: INITIALIZATION_FORBIDDEN');
        })
    })
})