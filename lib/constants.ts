export const WALLETS_API_URL =
  'https://importa-pay-payments-x72y4.ondigitalocean.app/api/wallets/fetch-personal-users'

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || ''
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '') as `0x${string}`
export const PROXY_ADDRESS = (process.env.NEXT_PUBLIC_PROXY_ADDRESS ||
  '') as `0x${string}`

export const QUERY_STALE_TIME = 30000 // 30 seconds
export const QUERY_CACHE_TIME = 300000 // 5 minutes

export const BLOCKS_PER_DAY = 28800 // Approximate for Hedera (~3 second block time)
export const TOKEN_DECIMALS = 18
