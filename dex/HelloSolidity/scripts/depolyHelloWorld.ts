import { ethers } from 'ethers';
import helloWorldArtifact from "../artifacts/contracts/HelloWorld.sol/HelloWorld.json";

//書き方色々
async function main() {
//const main = async function() {
//const main = async () => {
    const privateKey: string = process.env.PRIVATE_KEY ?? "";
    if (privateKey === "") {
        throw new Error("No value set for environment variable PRIVATE_KEY");
    }
    const rpcUrl: string = process.env.SEPOLIA_URL ?? "";
    if (rpcUrl === "") {
        throw new Error('No value set for environment variable SEPOLIA_URL');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);//プロバイダ＝プロジェクトがブロックチェーンと対話できるようにする仕組み
    const singer = new ethers.Wallet("a9f7d0bfe1a1f20999aeb8e84e58256abe33982a70a5cf2960d9aa52d2d82191", provider);
    const factory = new ethers.ContractFactory(helloWorldArtifact.abi, helloWorldArtifact.bytecode, singer);
    const contract = await factory.deploy();//トランザクションが送られるのを待っている
    console.log(`HelloWorld contract deploy address ${contract.address}`);
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${contract.deployTransaction.hash}`);
    await contract.deployed(); //トランザクションが実行されるまで待つ。つまり、ブロックに取り込まれるまで待つ。
    console.log(`Deploy completed`)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

