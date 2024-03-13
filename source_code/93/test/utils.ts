import { ethers } from "hardhat";
import { expect } from "chai";
import type { Signer, BigNumber } from "ethers";
import { richAddress, udexAddress  } from "./constants.ts";
import IERC20 from "../artifacts/contracts/interfaces/IERC20.sol/IERC20.json";
import IUdexRouter from "../artifacts/contracts/interfaces/IUdexRouter.sol/IUdexRouter.json";

export async function getRichSigner(): Signer {
    const richSigner: Signer = await ethers.getImpersonatedSigner(richAddress);
    return richSigner
}

async function addLiquidity(token0: Contract, token1: Contract, amount0: BigNumber, amount1: BigNumber, signer: Signer) {
    await token0.connect(signer).approve(udexAddress.router, amount0);
    await token1.connect(signer).approve(udexAddress.router, amount1);
    const router = new ethers.Contract(udexAddress.router, IUdexRouter.abi, signer)
    const deadline = Math.floor(Date.now() / 1000) + 60; 
    const tx = await router.connect(signer).addLiquidity(
        token0.address, token1.address, amount0, amount1, 0, 0, signer.address, deadline
    )
    await tx.wait()
}

export async function setupPool(tokenAddressPair: [string, string], tokenDecimalsPair: [number, number], displayAmountPair: [string, string], signer: Signer) {
    expect(tokenAddressPair[0] < tokenAddressPair[1]).to.eq(true)
    const token0 = new ethers.Contract(tokenAddressPair[0], IERC20.abi, ethers.provider)
    const token1 = new ethers.Contract(tokenAddressPair[1], IERC20.abi, ethers.provider)
    const amount0 = ethers.utils.parseUnits(displayAmountPair[0], tokenDecimalsPair[0])
    const amount1 = ethers.utils.parseUnits(displayAmountPair[1], tokenDecimalsPair[1])
    await addLiquidity(token0, token1, amount0, amount1, signer)
}