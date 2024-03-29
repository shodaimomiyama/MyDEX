import { ethers, BigNumber } from "ethers";

export function getCreate2Address(factoryAddress: string, [tokenA, tokenB]: [string, string], bytecode: string): string {
    const [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]
    const create2Inputs = [
        '0xff',
        factoryAddress,
        ethers.utils.keccak256(ethers.utils.solidityPack(['address', 'address'], [token0, token1])),
        ethers.utils.keccak256(bytecode)
    ]
    const sanitizedInputs = `0x${create2Inputs.map(i => i.slice(2)).join('')}`
    return ethers.utils.getAddress(`0x${ethers.utils.keccak256(sanitizedInputs).slice(-40)}`)
}

//swapで入金額に対して出金額を計算できる関数
//reserveIn:入金側のトークンの流動性プール内の量
//reserveOut:出金側のトークンの流動性プール内の量
//|:ユニオン 型or型
export function getAmountOut(amountIn: BigNumber | number, reserveIn: BigNumber | number, reserveOut: BigNumber | number): BigNumber {
    //定数積公式によるAMM
    const amountInWithFee: BigNumber = BigNumber.from(amountIn).mul(997) //DA
    const numerator: BigNumber = amountInWithFee.mul(reserveOut) //DA*XB(分子)
    const denominator: BigNumber = (BigNumber.from(reserveIn).mul(1000)).add(amountInWithFee) //XA+DA(分母)
    const amountOut = numerator.div(denominator)
    return amountOut
} 