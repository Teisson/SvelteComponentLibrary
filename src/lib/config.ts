import { http, createConfig } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'

const chains = [mainnet, sepolia] as const;

export const config = createConfig({
  chains: chains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})