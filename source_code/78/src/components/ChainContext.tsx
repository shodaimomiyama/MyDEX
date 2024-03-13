import { useState, createContext } from 'react'
import type React from 'react'
import { ethers, providers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

type Chain = any
export const ChainContext = createContext<Chain>({})

type ChainContextProviderProps = { children: React.ReactNode }
export const ChainContextProvider = ({ children }: ChainContextProviderProps) => {
    const [chainId, setChainId] = useState<number>()
    const [currentAccount, setCurrentAccount] = useState<string>()

    async function connectWallet() {
        const provider = await detectEthereumProvider({ silent: true })
        if (provider) {
            const ethersProvider = new providers.Web3Provider(provider)
            // account
            const accountList: string[] = await ethersProvider.listAccounts()
            if (accountList.length === 0) { alert('Please unlock Metamask Wallet and/or connect to an account.'); return }
            setCurrentAccount(ethers.utils.getAddress(accountList[0]))
            // chainId
            const network = await ethersProvider.getNetwork()
            const chainId = network.chainId
            setChainId(chainId)
        } else {
            alert('Please install Metamask Wallet.')
        }

    }

    return (
        <ChainContext.Provider
            value = {{
                chainId,
                currentAccount,
                connectWallet
            }}
        >
            {children}
        </ChainContext.Provider>
    )
}