import { ethers } from "ethers";
import helloWorldArtifact from '../artifacts/contracts/HelloWorld.sol/HelloWorld.json';

async function main(){
    const privateKey: string = process.env.PRIVATE_KEY ?? "";
    if (privateKey === "") {
        throw new Error('No value set for environement variable PRIVATE_KEY');
    }
    const rpcUrl: string = process.env.SEPOLIA_URL ?? "";
    if (rpcUrl === "") {
        throw new Error('No value set for environement variable SEPOLIA_URL');
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const factory = new ethers.ContractFactory(helloWorldArtifact.abi, helloWorldArtifact.bytecode, signer);
    const contract = await factory.deploy();
    console.log(`HellowWorld contract deploy address ${contract.address}`);
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${contract.deployTransaction.hash}`);
    await contract.deployed();
    console.log(`Deploy completed`)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});