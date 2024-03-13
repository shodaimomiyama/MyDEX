import Head from 'next/head'
import { useState } from 'react'
import type { NextPage } from 'next'

const IndexPage: NextPage = () => {
  const [count, setCount] = useState<number>(0)

  return (
    <>
      <Head>
        <title>My Counter App</title>
      </Head>
      <main>
        <p> Counter: {count}</p>
        <button onClick={() => setCount((c: number) => c + 1)}>Increase</button>
        <button onClick={() => setCount((c: number) => c - 1)}>Decrease</button>
      </main>
    </>
  )
}

export default IndexPage