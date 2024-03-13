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
    const { chainId } = useContext(ChainContext)

    function handleAmountInChange(e: ChangeEvent<HTMLInputElement>) {
        const cleansedDisplayAmountIn = e.target.value.replace(/[^0-9.]/g, '')  // remove characters except numbers and Dot
        setInField((prevState: TokenField) => {return { ...prevState, displayAmount: cleansedDisplayAmountIn }})
    }

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
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Swap
