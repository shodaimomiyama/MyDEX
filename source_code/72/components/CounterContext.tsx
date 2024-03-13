import { useState, createContext } from 'react'
import type React from 'react'

type Counter = { 'count': number, 'setCount': React.Dispatch<React.SetStateAction<number>> }
export const CounterContext = createContext<Counter>({ count: 0, setCount: (s: React.SetStateAction<number>) => {} })

type CounterContextProviderProps = { children: React.ReactNode }
export const CounterContextProvider = ({ children }: CounterContextProviderProps) => {
    const [count, setCount] = useState(0)

    return (
        <CounterContext.Provider value={{ count, setCount }}>
            {children}
        </CounterContext.Provider>
    )
}