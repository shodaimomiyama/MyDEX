import type { AppProps } from 'next/app'
import { CounterContextProvider } from '../components/CounterContext'

export default function App({ Component, pageProps }: AppProps) {
    return (
      <CounterContextProvider>
          <Component {...pageProps} />
      </CounterContextProvider>
    )
}
