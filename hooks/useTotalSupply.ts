'use client'

import { useQuery } from '@tanstack/react-query'
import { createPublicClient, http } from 'viem'
import { defineChain } from 'viem'
import { tNGN_ABI } from '@/lib/abi'
import { RPC_URL, PROXY_ADDRESS, QUERY_STALE_TIME, QUERY_CACHE_TIME } from '@/lib/constants'

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

const fetchTotalSupply = async (): Promise<bigint> => {
  const totalSupply = await publicClient.readContract({
    address: PROXY_ADDRESS,
    abi: tNGN_ABI,
    functionName: 'totalSupply',
  })

  return totalSupply as bigint
}

export const useTotalSupply = () => {
  return useQuery({
    queryKey: ['totalSupply'],
    queryFn: fetchTotalSupply,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_CACHE_TIME,
    retry: 3,
  })
}
