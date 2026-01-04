'use client'

import { useQuery } from '@tanstack/react-query'
import { createPublicClient, http, defineChain } from 'viem'
import { RPC_URL } from '@/lib/constants'

const hedera = defineChain({
  id: 295,
  name: 'Hedera Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
})

const publicClient = createPublicClient({
  chain: hedera,
  transport: http(RPC_URL),
})

const checkRpcConnection = async (): Promise<boolean> => {
  try {
    await publicClient.getBlockNumber()
    return true
  } catch (error) {
    console.error('RPC connection error:', error)
    return false
  }
}

export const useRpcStatus = () => {
  return useQuery({
    queryKey: ['rpcStatus'],
    queryFn: checkRpcConnection,
    refetchInterval: 10000, // Check every 10 seconds
    retry: false,
  })
}
