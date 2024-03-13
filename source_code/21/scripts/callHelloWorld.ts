import { ethers } from "ethers";
import helloWorldArtifact from '../artifacts/contracts/HelloWorld.sol/HelloWorld.json';

async function main(address: string){
    const rpcUrl: string = process.env.SEPOLIA_URL ?? "https://sepolia.infura.io/v3/a5ec5aaff52d4cebbecc64686b280965";
    if (rpcUrl === "") {
        throw new Error('No value set for environement variable SEPOLIA_URL');
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(address, helloWorldArtifact.abi, provider);

    const message = await contract.getMessage();
    console.log(`Helloworld contract message: ${message} `)
}

const address = "0x5c2950C3D24e839bEBFb057A2cABEE8A53db92aD"
main(address).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});