import { formatUnits } from 'viem'
import { TOKEN_DECIMALS } from './constants'

export const formatTokenAmount = (amount: bigint, decimals: number = 2): string => {
  const formatted = formatUnits(amount, TOKEN_DECIMALS)
  const number = parseFloat(formatted)

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(decimals)}B`
  } else if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(decimals)}M`
  } else if (number >= 1_000) {
    return `${(number / 1_000).toFixed(decimals)}K`
  }

  return number.toFixed(decimals)
}

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }

  return num.toLocaleString()
}

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
