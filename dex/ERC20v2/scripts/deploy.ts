import { ethers } from 'ethers';
import erc20Artifact from '../artifacts/contracts/ERC20.sol/ERC20.json'; //tsconfig.jsonで"resolveJsonModule":trueを付け加えるとエラーなくなる
import { program, Option } from 'commander';

//以下の2行で環境変数（PRIVATE_KEYなど）が.envから読み込めるようになる
import * as dotenv from 'dotenv';
dotenv.config();

//書き方色々
async function main(name: string, symbol: string, decimals: number) {
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

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);//プロバイダ＝プロジェクトがブロックチェーンと対話できるようにする仕組み
    const singer = new ethers.Wallet("a9f7d0bfe1a1f20999aeb8e84e58256abe33982a70a5cf2960d9aa52d2d82191", provider);
    const factory = new ethers.ContractFactory(erc20Artifact.abi, erc20Artifact.bytecode, singer);
    const contract = await factory.deploy(name, symbol, decimals);//トランザクションが送られるのを待っている
    console.log(`ERC20 contract deploy address ${contract.address}`);
    console.log(`Transaction URL: https://sepolia.etherscan.io/tx/${contract.deployTransaction.hash}`);
    await contract.deployed(); //トランザクションが実行されるまで待つ。つまり、ブロックに取り込まれるまで待つ。
    console.log(`Deploy completed`)
}

//（terminalから）コマンドでコンストラクタの引数を設定できる
program
    .addOption(new Option('--name <string>', 'name of token (e.g. bitcoin)').makeOptionMandatory())
    .addOption(new Option('--symbol <string>', 'symbol of token (e.g. BTC)').makeOptionMandatory())
    .addOption(new Option('--decimals <string>', 'decimals of token (e.g. 18)').argParser(parseInt).makeOptionMandatory()).parse()
const options = program.opts()


main(options.name, options.symbol, options.decimals).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});