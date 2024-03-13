 import { expect } from "chai";
 import { ethers, networks } from "hardhat";
 import type { Provider, Signer } from "ethers";
 import { tokenData } from "./constants.ts";
 import { getRichSigner } from "./utils.ts";
 import IERC20 from "../artifacts/contracts/interfaces/IERC20.sol/IERC20.json";

 describe("RichSigner", function () {
    before(async function () {
        const forking = config.networks.hardhat.forking
        await network.provider.request({
            method: "hardhat_reset", 
            params: [{forking: {jsonRpcUrl: forking.url, blockNumber: forking.blockNumber}}]
        }); 
    });
        
    it("rich signer has enough initial balances", async function () {
        const provider: Provider = ethers.provider;
        const rich: Signer = await getRichSigner();

        const usdc = new ethers.Contract(tokenData.usdc.address, IERC20.abi, provider);
        expect(await usdc.balanceOf(rich.address)).to.gt(ethers.utils.parseUnits('500000', tokenData.usdc.decimals));
        const wbtc = new ethers.Contract(tokenData.wbtc.address, IERC20.abi, provider);
        expect(await wbtc.balanceOf(rich.address)).to.gt(ethers.utils.parseUnits('50', tokenData.wbtc.decimals));
        const dai = new ethers.Contract(tokenData.dai.address, IERC20.abi, provider);
        expect(await dai.balanceOf(rich.address)).to.gt(ethers.utils.parseUnits('200000', tokenData.dai.decimals));
        const matic = new ethers.Contract(tokenData.matic.address, IERC20.abi, provider);
        expect(await matic.balanceOf(rich.address)).to.gt(ethers.utils.parseUnits('100', tokenData.matic.decimals));
    });
 });