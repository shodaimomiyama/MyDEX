import { ethers } from "ethers";
import helloWorldArtifact from '../artifacts/contracts/HelloWorld.sol/HelloWorld.json';

async function main(address: string){
    const rpcUrl: string = process.env.SEPOLIA_URL ?? "";
    if (rpcUrl === "") {
        throw new Error('No value set for environement variable SEPOLIA_URL');
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contrat = new ethers.Contract(address, helloWorldArtifact.abi, provider);

    const message = await contrat.getMessage();
    console.log(`Helloworld contract message: ${message} `)
}

const address = "0xa4E458D7133C6F0390F784A8cccCeDb74cC26965";
main(address).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});