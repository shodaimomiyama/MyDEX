import { useState, useContext } from 'react'
import type React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { NextPage } from 'next'
import { CounterContext } from '../components/CounterContext'

const InputPage: NextPage = () => {
    const { count, setCount } = useContext(CounterContext)

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const value: number = parseInt(e.target.value)
        setCount(value)
    }

    return (
        <>
            <Head>
                <title>Input Value</title>
            </Head>
            <main>
                <p>Counter: {count}</p>
                <input onInput={handleInput} />
                <p>
                    <Link href="/">home</Link>
                </p>
            </main>
        </>
    )
}

export default InputPage