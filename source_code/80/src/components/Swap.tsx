import { ethers } from "ethers"
import type { BigNumber } from "ethers"
import { useContext, useState, useEffect } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { ArrowDownIcon } from '@heroicons/react/24/solid'
import { ChainContext } from './ChainContext'
import TokenCombobox from './TokenCombobox'
import { loadTokenData } from '@/lib/load'
import { getAmountOut } from '@/lib/utilities'
import logo from '../../public/logo.svg'
import { swapStyle as style } from '@/styles/tailwindcss'
import UdexPool from '../../hardhat/artifacts/contracts/UdexPool.sol/UdexPool.json'

export interface TokenField {
    address: string,
    displayAmount: string,
    displayBalance: string,
}

const Swap = () => {
    const emptyField: TokenField = { address: '', displayAmount: '', displayBalance: '' }
    const [inField, setInField] = useState<TokenField>(emptyField)
    const [outField, setOutField] = useState<TokenField>(emptyField)
    const { chainId, signer, getDisplayBalance, getPoolAddress } = useContext(ChainContext)

    function handleAmountInChange(e: ChangeEvent<HTMLInputElement>) {
        const cleansedDisplayAmountIn = e.target.value.replace(/[^0-9.]/g, '')  // remove characters except numbers and Dot
        setInField((prevState: TokenField) => {return { ...prevState, displayAmount: cleansedDisplayAmountIn }})
    }

    useEffect(() => {
        if ((inField.displayAmount !== "") && (inField.address !== "") && (outField.address !=="") && (inField.address !== outField.address)) {
            const updateDisplayAmountOut = async function(addressIn: string, addressOut: string, amountIn: BigNumber, decimalsOut: number) {
                const poolAddress: string | undefined = await getPoolAddress(addressIn, addressOut)
                if (poolAddress === undefined) {
                    alert('Pool does not exist for this token pair')
                } else {
                    const pool = new ethers.Contract(poolAddress, UdexPool.abi, signer.provider)
                    const reserve0 = await pool.reserve0()
                    const reserve1 = await pool.reserve1()
                    const [reserveIn, reserveOut] = addressIn < addressOut ? [reserve0, reserve1] : [reserve1, reserve0]
                    const amountOut = getAmountOut(amountIn, reserveIn, reserveOut)
                    const displayAmount: string = ethers.utils.formatUnits(amountOut, decimalsOut)
                    setOutField((prevState: TokenField) => {return { ...prevState, displayAmount: displayAmount }})
                }
            }

            const addressIn = inField.address
            const addressOut = outField.address
            const decimalsIn = loadTokenData(chainId, addressIn)!.decimals
            const decimalsOut = loadTokenData(chainId, addressOut)!.decimals
            let amountIn: BigNumber
            try {
                amountIn = ethers.utils.parseUnits(inField.displayAmount, decimalsIn)
            } catch (e: any) {
                alert(`Invalid input: ${e.reason}`)
                return
            }
            updateDisplayAmountOut(addressIn, addressOut, amountIn, decimalsOut)
        }

        // if input amount is empty, then clear the output amount
        if (inField.displayAmount === "") {
            setOutField((prevState: TokenField) => {return { ...prevState, displayAmount: "" }})
        }
    }, [inField.address, inField.displayAmount, outField.address, chainId, getPoolAddress, signer])

    useEffect(() => {
        if (inField.address !== "" && inField.address === outField.address) {
            setTimeout(() => { alert("Please select a different token") }, 0)
            return
        }

        // Show "Balance" of each token
        if (inField.address !== "") {
            getDisplayBalance(inField.address).then((displayBalance: string) => {
                setInField((prevState: TokenField) => { return { ...prevState, displayBalance: displayBalance }})
            })
        }
        if (outField.address !== "") {
            getDisplayBalance(outField.address).then((displayBalance: string) => {
                setOutField((prevState: TokenField) => {return { ...prevState, displayBalance: displayBalance }})
            })
        }
    }, [inField.address, outField.address, getDisplayBalance])

    return (
        <div className={style.outerContainer}>
            <div className={style.container}>
                <div className={style.boxHeader}>
                    <div>Swap</div>
                </div>
                {/* input field */}
                <div className={style.currencyContainer}>
                    <input
                        type='text'
                        className={style.currencyInput}
                        placeholder='0'
                        value={inField.displayAmount}
                        onChange={handleAmountInChange}
                    />
                    <div className={style.currencySelectorContainer}>
                        <div className={style.currencySelector} style={{ zIndex: 1 }}>
                            <TokenCombobox chainId={chainId} setTokenField={setInField}/>
                        </div>
                        <div className={style.currencyBalanceContainer}>
                            <div className={style.currencyBalance}>
                                { inField.displayBalance != "" ? <>{`Balance: ${inField.displayBalance}`}</> : null }
                            </div>
                        </div>
                    </div>
                </div>
                {/* down arrow box */}
                <div className={style.arrowContainer}>
                    <div className={style.arrowBox}>
                        <ArrowDownIcon className={style.arrowIcon}/>
                    </div>
                </div>
                {/* output field */}
                <div className={style.currencyContainer}>
                    <input
                        type='text'
                        className={style.currencyInput}
                        placeholder='0'
                        disabled={true}
                        value={outField.displayAmount}
                    />
                    <div className={style.currencySelectorContainer}>
                        <div className={style.currencySelector}>
                            <TokenCombobox chainId={chainId} setTokenField={setOutField}/>
                        </div>
                        <div className={style.currencyBalanceContainer}>
                            <div className={style.currencyBalance}>
                                { outField.displayBalance != "" ? <>{`Balance: ${outField.displayBalance}`}</> : null }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Swap
