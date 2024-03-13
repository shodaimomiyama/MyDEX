import Head from 'next/head'
import Link from 'next/link'
import { useState, useContext } from 'react'
import type { NextPage } from 'next'
import { CounterContext } from '../components/CounterContext'

const IndexPage: NextPage = () => {
    const { count, setCount } = useContext(CounterContext)

    return (
        <>
            <Head>
                <title>My Counter App</title>
            </Head>
            <main>
                <p> Counter: {count}</p>
                <button onClick={() => setCount((c: number) => c + 1)}>Increase</button>
                <button onClick={() => setCount((c: number) => c - 1)}>Decrease</button>
                <p>
                    <Link href="/input">input</Link>
                </p>
            </main>
        </>
    )
}

export default IndexPage