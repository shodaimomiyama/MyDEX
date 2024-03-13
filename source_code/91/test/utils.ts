import { ethers } from "hardhat";
import type { Signer } from "ethers";
import { richAddress } from "./constants.ts";

export async function getRichSigner(): Signer {
    const richSigner: Signer = await ethers.getImpersonatedSigner(richAddress);
    return richSigner
}