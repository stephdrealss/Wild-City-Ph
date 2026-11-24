// Type declarations for Arc Studio's deploy helper package, which is only installed inside Arc Studio.
declare module '@circlefin/compass-chains' {
  export interface CompassChain {
    id: number
    name: string
    explorerUrl?: string
    nativeCurrency: { name: string; symbol: string; decimals: number }
    rpcUrls?: { default: { http: string[] } }
  }
  export function getChain(id: string): CompassChain
}
