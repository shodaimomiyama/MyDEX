import { useContext } from 'react'
import type { NextPage } from 'next'
import { ChainContext } from '@/components/ChainContext'
import Link from 'next/link'

const Header: NextPage = () => {
    const { connectWallet } = useContext(ChainContext)

    return (
        <>
            <div>
                <Link href="/swap"> [jump to swap] </Link>
                <Link href="/pool"> [jump to pool] </Link>
            </div>
            <div onClick={() => connectWallet()}>
                <div> [Connect Wallet] </div>
            </div>
            <p> ---------------------- End of Header ----------------------- </p>
        </>
    )
}

export default Header