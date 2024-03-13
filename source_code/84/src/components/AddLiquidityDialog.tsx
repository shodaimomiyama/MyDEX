import { ethers, BigNumber } from "ethers"
import { useContext, useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ChainContext } from '@/components/ChainContext'
import { loadTokenData } from '@/lib/load'
import type { TokenData } from '@/lib/load'
import type { TokenField } from '@/components/Swap'
import TokenCombobox from '@/components/TokenCombobox'
import { AddLiquidityStyle as style } from '@/styles/tailwindcss'
import UdexPool from '../../hardhat/artifacts/contracts/UdexPool.sol/UdexPool.json'

interface AddLiquidityDialogProps {
    show: boolean
    onClose: () => void
}

const AddLiquidityDialog = (props: AddLiquidityDialogProps) => {
    const { show, onClose } = props
    const emptyField: TokenField = { address: '', displayAmount: '', displayBalance: '' }
    const [AField, setAField] = useState<TokenField>(emptyField)
    const [BField, setBField] = useState<TokenField>(emptyField)
    const [isNewPair, setIsNewPair] = useState<boolean>(false)
    const { chainId, signer, getDisplayBalance, getPoolAddress } = useContext(ChainContext)

    function closeAndCleanUp() {
        onClose()
        setAField(emptyField)
        setBField(emptyField)
        setIsNewPair(false)
    }

    function handleAmountAChange(e: ChangeEvent<HTMLInputElement>) {
        const cleansedDisplayAmountIn = e.target.value.replace(/[^0-9.]+/g, '')  // remove characters except numbers and DOT
        setAField((prevState: TokenField) => {return { ...prevState, displayAmount: cleansedDisplayAmountIn }})
    }

    function handleAmountBChange(e: ChangeEvent<HTMLInputElement>) {
        const cleansedDisplayAmountIn = e.target.value.replace(/[^0-9.]+/g, '')  // remove characters except numbers and DOT
        setBField((prevState: TokenField) => {return { ...prevState, displayAmount: cleansedDisplayAmountIn }})
    }

    useEffect(() => {
        const updateDisplayAmountB = async function(addressA: string, addressB: string, amountA: BigNumber, decimalsB: number) {
            const poolAddress: string | undefined = await getPoolAddress(addressA, addressB)
            if (poolAddress !== undefined) {
                const pool = new ethers.Contract(poolAddress, UdexPool.abi, signer.provider);
                const reserve0 = await pool.reserve0()
                const reserve1 = await pool.reserve1()
                const [reserveA, reserveB] = (addressA < addressB) ? [reserve0, reserve1] : [reserve1, reserve0]
                const amountB: BigNumber = amountA.mul(reserveB).div(reserveA)
                const displayAmountB: string = ethers.utils.formatUnits(amountB, decimalsB)
                setBField((prevState: TokenField) => {return { ...prevState, displayAmount: displayAmountB }})
            }
        }

        if ((AField.displayAmount !== "") && (AField.address !== "") && (BField.address !== "") && (AField.address !== BField.address)) {
            const addressA = AField.address
            const addressB = BField.address
            const tokenAData: TokenData = loadTokenData(chainId, addressA)!
            const tokenBData: TokenData = loadTokenData(chainId, addressB)!
            let amountA: BigNumber
            try {
                amountA = ethers.utils.parseUnits(AField.displayAmount, tokenAData.decimals)
            } catch (e: any) {
                alert(`Invalid input: ${e.reason}`)
                return
            }
            updateDisplayAmountB(addressA, addressB, amountA, tokenBData.decimals)
        }

        // if input amount is empty, then clear the output amount
        if (AField.displayAmount === "") {
            setBField((prevState: TokenField) => {return { ...prevState, displayAmount: "" }})
        }
    }, [AField.address, AField.displayAmount, BField.address, chainId, signer, getPoolAddress])

    useEffect(() => {
        if (AField.address !== "" && AField.address === BField.address) {
            alert("Please select a different token")
            return
        }

        if (AField.address !== "" && BField.address !=="") {
            getPoolAddress(AField.address, BField.address).then((poolAddress: string | undefined) => {
                if (poolAddress === undefined) { setIsNewPair(true) } else { setIsNewPair(false) }
            })
        }

        // Show "Balance" of each token
        if (AField.address !== "") {
            getDisplayBalance(AField.address).then((displayBalance: string) => {
                setAField((prevState: TokenField) => {return { ...prevState, displayBalance: displayBalance }})
            })
        }
        if (BField.address !== "") {
            getDisplayBalance(BField.address).then((displayBalance: string) => {
                setBField((prevState: TokenField) => {return { ...prevState, displayBalance: displayBalance }})
            })
        }
    }, [AField.address, BField.address, getDisplayBalance, getPoolAddress])

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className={style.dialog} onClose={closeAndCleanUp}>
                <Dialog.Overlay className={style.overlay}/>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div className={style.panelContainer}>
                        <Dialog.Panel className={style.panel}>
                            <div className={style.titleContainer}>
                                <Dialog.Title as="h3" className={style.title}>
                                    Add Liquidity to a Pool
                                </Dialog.Title>
                            </div>
                            <div>
                                {/* token A */}
                                <div className={style.currencyContainer}>
                                    <div className={style.currencyInputContainer}>
                                        <input
                                            type='text'
                                            className={style.currencyInput}
                                            placeholder='0'
                                            onChange={handleAmountAChange}
                                            value={AField.displayAmount}
                                        />
                                    </div>
                                    <div className={style.currencySelector}>
                                        <TokenCombobox chainId={chainId} setTokenField={setAField}/>
                                    </div>
                                </div>
                                <div className={style.currencyBalanceContainer}>
                                    <div className={style.currencyBalance}>
                                        { AField.displayBalance !== "" ? (<>{`Balance: ${AField.displayBalance}`}</>) : null }
                                    </div>
                                </div>
                                {/* token B*/}
                                <div className={style.currencyContainer}>
                                    <div className={style.currencyInputContainer}>
                                        <input
                                            type='text'
                                            className={style.currencyInput}
                                            placeholder='0'
                                            disabled={!isNewPair}
                                            onChange={handleAmountBChange}
                                            value={BField.displayAmount}
                                        />
                                    </div>
                                    <div className={style.currencySelector}>
                                        <TokenCombobox chainId={chainId} setTokenField={setBField}/>
                                    </div>
                                </div>
                                <div className={style.currencyBalanceContainer}>
                                    <div className={style.currencyBalance}>
                                        { BField.displayBalance !== "" ? (<>{`Balance: ${BField.displayBalance}`}</>) : null }
                                    </div>
                                </div>
                                {/* buttons */}
                                <div className={style.messageContainer}>
                                    {isNewPair ? (<div>New Pool will be created. Please deposit tokens of equal value at current market prices.</div>) : null }
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition>
    )
}

export default AddLiquidityDialog