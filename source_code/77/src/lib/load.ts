import _chains from '../../data/chains.json'

const chains: ChainData[] = _chains

export interface ChainData {
    chainId: number
    name: string
    symbol: string
    explorer: string
    logo: string
}

export function loadChainData(chainId: number): ChainData | undefined {
    return chains.filter((d: ChainData) => d.chainId === chainId)[0]
}

export function loadChainLogo(chainId: number): string {
    const chain = loadChainData(chainId)
    if (chain !== undefined) {
        return `/${chain.logo}`
    } else {
        return ''
    }
}