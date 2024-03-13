import { ethers } from "ethers"
import { BigNumber } from "ethers"
import { useContext, useState, useEffect } from 'react'
import Image from 'next/image'
import { MinusCircleIcon } from '@heroicons/react/24/outline'
import { ChainContext } from '@/components/ChainContext'
import { loadTokenData, loadTokenLogo } from '@/lib/load'
import { positionItemStyle as style } from '@/styles/tailwindcss'
import UdexPool from '../../hardhat/artifacts/contracts/UdexPool.sol/UdexPool.json'
import UdexERC20 from '../../hardhat/artifacts/contracts/UdexERC20.sol/UdexERC20.json'

export interface PositionData {
    address0: string
    address1: string
    liquidity: BigNumber
}

interface PositionItemProps {
    value: PositionData
}

const PositionItem = (props: PositionItemProps) => {
    const address0 = props.value.address0
    const address1 = props.value.address1
    const liquidity = props.value.liquidity
    const [displayAmount0, setDisplayAmount0] = useState<string>('')
    const [displayAmount1, setDisplayAmount1] = useState<string>('')
    const { chainId, currentAccount, signer, routerAddress, getPoolAddress } = useContext(ChainContext)
    const token0Data = loadTokenData(chainId, address0)!
    const token1Data = loadTokenData(chainId, address1)!

    useEffect(() => {
        const updateDisplayAmount = async function() {
            const poolAddress = await getPoolAddress(address0, address1)
            const pool = new ethers.Contract(poolAddress, UdexPool.abi, signer.provider)
            const totalSupply = await pool.totalSupply()

            const token0Contract = new ethers.Contract(address0, UdexERC20.abi, signer.provider)
            token0Contract.balanceOf(pool.address).then((reserve0: BigNumber) => {
                const amount0: BigNumber = (reserve0.mul(liquidity)).div(totalSupply)
                setDisplayAmount0(ethers.utils.formatUnits(amount0.toString(), token0Data.decimals))
            })
            const token1Contract = new ethers.Contract(address1, UdexERC20.abi, signer.provider)
            token1Contract.balanceOf(pool.address).then((reserve1: BigNumber) => {
                const amount1: BigNumber = (reserve1.mul(liquidity)).div(totalSupply)
                setDisplayAmount1(ethers.utils.formatUnits(amount1.toString(), token1Data.decimals))
            })
        }
        updateDisplayAmount()
    }, [signer, getPoolAddress, address0, address1, liquidity, token0Data.decimals, token1Data.decimals])

    return (
        <div>
            {/* header (logo) */}
            <div className={style.header}>
                <div className={style.pairLogoContainer}>
                    <div> <Image src={loadTokenLogo(chainId, address0)} alt='logo0' height={18} width={18} />  </div>
                    <div className="-ml-2"> <Image src={loadTokenLogo(chainId, address1)} alt='logo1' height={18} width={18} /> </div>
                </div>
                <div className={style.pairTextContainer}>
                    <span>{token0Data.symbol}</span> <span> / </span> <span>{token1Data.symbol}</span>
                </div>
            </div>
            {/* balance, button */}
            <div className={style.balanceContainer}>
                <div className={style.balance}>
                    <div className={style.balanceText}>{token0Data.symbol} Locked Balance: {displayAmount0}</div>
                    <div className={style.balanceText}>{token1Data.symbol} Locked Balance: {displayAmount1}</div>
                </div>
                <div className={style.removeButtonContainer}>
                    <div className={style.removeButton}>
                        <MinusCircleIcon className={style.circleIcon}/>
                        Remove
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PositionItem