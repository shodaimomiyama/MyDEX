import { ethers } from "ethers";
import helloworldArtifact from "../artifacts/contracts/HelloWorld.sol/HelloWorld.json"
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";

async function main() {
    const privateKey: string = process.env.PRIVATE_KEY ?? ""
    if (privateKey === "") { //===: 厳密等価演算子（型までみる）
        throw new Error('No value set for environment variable PRIVATE_KEY');
    }
    const rpcUrl: string = process.env.SEPOLIA_URL ?? ""
    if (rpcUrl === "") { //===: 厳密等価演算子（型までみる）
        throw new Error('No value set for environment variable SEPOLIA_URL');
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    //プロバイダーは、イーサリアムネットワークへの接続を抽象化したものであり、標準のイーサリアムノード機能への簡潔で一貫性のあるインターフェイスを提供します。
    //JsonRpcProvider(rpcUrl)で、自分のInflaのAPIkeyを伴って(利用して)SepoliaTestnetへの接続（ノードへの接続）を指定する。
    const signer = new ethers.Wallet(privateKey, provider); //秘密鍵からWalletを作成
    //Signerとは署名するためのクラスで、WalletはSignerの一種です。
    const factory = new ethers.ContractFactory(helloworldArtifact.abi, helloworldArtifact.bytecode, signer);
    //compileしたcontract(HelloWorld.sol)の内容(helloworldArtifact.abi, helloworldArtifact.bytecode)とBC接続のための署名(signer)をfactoryにまとめて渡す。
    const contract = await factory.deploy(); //txが送られるのを待つ
    console.log(`HelloWorld contract deploy address ${contract.address}`);
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${contract.deployTransaction.hash}`);
    await contract.deployed(); //txが実行される（ブロックに取り込まれる）まで待つ。
    console.log("deploy completed")

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});