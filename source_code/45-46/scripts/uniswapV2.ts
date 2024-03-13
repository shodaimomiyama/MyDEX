import { ethers } from 'ethers';
import { program, Option } from 'commander';
import * as dotenv from 'dotenv';
dotenv.config();
import _tokens from '../data/tokens.json';
import { abi as IUniswapV2FactoryABI }  from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IUniswapV2PairABI }  from '@uniswap/v2-core/build/IUniswapV2Pair.json';

const chainId = 1; // Ethereum Network
const FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const tokens: TokenData[] = _tokens;

export interface TokenData {
    chainId: number
    symbol: string
    address: string
    decimals: number
}

async function main(tokenSymbolA: string, tokenSymbolB: string) {
    const rpcUrl: string = process.env.ETHEREUM_URL ?? "";
    if (rpcUrl === "") {
        throw new Error('環境変数 ETHEREUM_URL の値が設定されていません');
    }

    if (tokenSymbolA === tokenSymbolB) {
        throw new Error('相異なるトークンを指定してください。');
    }
    const tokenA: TokenData = tokens.filter((d: TokenData) => (d.chainId === chainId) && (d.symbol == tokenSymbolA))[0]
    if (tokenA === undefined ) {
        throw new Error(`${tokenSymbolA} というシンボルをもつトークンが token.json に見つかりませんでした。`)
    }
    const tokenB: TokenData = tokens.filter((d: TokenData) => (d.chainId === chainId) && (d.symbol == tokenSymbolB))[0]
    if (tokenB === undefined ) {
        throw new Error(`${tokenSymbolB} というシンボルをもつトークンが token.json に見つかりませんでした。`)
    }
    const [token0, token1] = tokenA.address < tokenB.address ? [tokenA, tokenB] : [tokenB, tokenA]

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const factory = new ethers.Contract(FACTORY_ADDRESS, IUniswapV2FactoryABI, provider);
    const pairAddress = await factory.getPair(token0.address, token1.address);
    console.log(`${token0.symbol}-${token1.symbol} Pair Pool Address: ${pairAddress}`);
    const pairContract = new ethers.Contract(pairAddress, IUniswapV2PairABI, provider);

    const [reserve0, reserve1, blockTimestampLast] = await pairContract.getReserves();
    const denominator = BigInt(reserve0) * (10n ** BigInt(token1.decimals));
    const numerator = BigInt(reserve1) * (10n ** BigInt(token0.decimals));   
    const precision = 15;
    const price = Number(10n ** BigInt(precision) * numerator / denominator) / (10 ** precision);
    console.log(`1 ${token0.symbol} = ${price} ${token1.symbol}`);
    console.log(`1 ${token1.symbol} = ${1 / price} ${token0.symbol}`);
}

program
    .addOption(new Option('-A, --tokenSymbolA <symbol>', 'symbol of ERC20 token (e.g. WBTC)').makeOptionMandatory())
    .addOption(new Option('-B, --tokenSymbolB <symbol>', 'symbol of ERC20 token (e.g. WBTC)').makeOptionMandatory())
    .parse()
const options = program.opts();

main(options.tokenSymbolA, options.tokenSymbolB).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});