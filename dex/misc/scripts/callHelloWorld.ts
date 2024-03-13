import { ethers } from "ethers";
import helloworldArtifact from "../artifacts/contracts/HelloWorld.sol/HelloWorld.json"

async function main(address: string) {

    const rpcUrl: string = process.env.SEPOLIA_URL ?? ""
    if (rpcUrl === "") { //===: 厳密等価演算子（型までみる）
        throw new Error('No value set for environment variable SEPOLIA_URL');
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(address, helloworldArtifact.abi, provider);

    const message = await contract.getMessage(); //リモート(EVM)にあるcontract(HelloWorld.sol)の関数(getMessage())を呼び出した。
    console.log(`HelloWorld contract message: ${message}`);
}

const address = "0xe3556A1891ad090EEC768e532f64174714B2E648"; //contract address

main(address).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});