'use client'

import { useQuery } from '@tanstack/react-query'
import { createPublicClient, http, Address } from 'viem'
import { defineChain } from 'viem'
import { tNGN_ABI } from '@/lib/abi'
import {
  RPC_URL,
  PROXY_ADDRESS,
  QUERY_STALE_TIME,
  QUERY_CACHE_TIME,
  BLOCKS_PER_DAY,
} from '@/lib/constants'
import type {
  TransferEvent,
  MintEvent,
  BurnTransferEvent,
  FeesCollectedEvent,
  TokensBurnedEvent,
} from '@/lib/types'

interface ContractEventsData {
  transfers: TransferEvent[]
  mints: MintEvent[]
  burns: BurnTransferEvent[]
  feesCollected: FeesCollectedEvent[]
  tokensBurned: TokensBurnedEvent[]
}

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

const fetchContractEvents = async (
  walletAddresses: Address[]
): Promise<ContractEventsData> => {
  if (walletAddresses.length === 0) {
    console.log('[useContractEvents] No wallet addresses provided')
    return {
      transfers: [],
      mints: [],
      burns: [],
      feesCollected: [],
      tokensBurned: [],
    }
  }

  console.log('[useContractEvents] Fetching events for', walletAddresses.length, 'wallets')

  const currentBlock = await publicClient.getBlockNumber()
  const fromBlock = currentBlock - BigInt(BLOCKS_PER_DAY * 30) // Last 30 days

  console.log('[useContractEvents] Block range:', fromBlock.toString(), 'to', currentBlock.toString())

  // RPC providers limit eth_getLogs to ~10k blocks
  // So we chunk the requests
  const MAX_BLOCKS_PER_QUERY = 9999n
  const chunks: { from: bigint; to: bigint }[] = []

  let start = fromBlock
  while (start < currentBlock) {
    const end = start + MAX_BLOCKS_PER_QUERY > currentBlock
      ? currentBlock
      : start + MAX_BLOCKS_PER_QUERY
    chunks.push({ from: start, to: end })
    start = end + 1n
  }

  // Helper to process chunks with rate limiting
  const BATCH_SIZE = 3 // Process 3 chunks at a time
  const DELAY_MS = 100 // 100ms delay between batches

  const processBatches = async <T>(
    chunks: { from: bigint; to: bigint }[],
    fetchFn: (chunk: { from: bigint; to: bigint }) => Promise<T[]>
  ): Promise<T[]> => {
    const results: T[] = []

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.all(batch.map(fetchFn))
      results.push(...batchResults.flat())

      // Add delay between batches (except for the last batch)
      if (i + BATCH_SIZE < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS))
      }
    }

    return results
  }

  // Define zero address for burn and mint detection
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address

  // Fetch ALL Transfer events (including regular transfers, mints, and burns)
  const transferLogs = await processBatches(chunks, (chunk) =>
    publicClient.getLogs({
      address: PROXY_ADDRESS,
      event: tNGN_ABI.find((e) => e.type === 'event' && e.name === 'Transfer')!,
      fromBlock: chunk.from,
      toBlock: chunk.to,
    })
  )

  // Fetch FeesCollected events in batches
  const feesCollectedLogs = await processBatches(chunks, (chunk) =>
    publicClient.getLogs({
      address: PROXY_ADDRESS,
      event: tNGN_ABI.find((e) => e.type === 'event' && e.name === 'FeesCollected')!,
      fromBlock: chunk.from,
      toBlock: chunk.to,
    })
  )

  // Fetch TokensBurned events in batches
  const tokensBurnedLogs = await processBatches(chunks, (chunk) =>
    publicClient.getLogs({
      address: PROXY_ADDRESS,
      event: tNGN_ABI.find((e) => e.type === 'event' && e.name === 'TokensBurned')!,
      fromBlock: chunk.from,
      toBlock: chunk.to,
    })
  )

  console.log('[useContractEvents] Raw logs fetched:', {
    transferLogs: transferLogs.length,
    feesCollectedLogs: feesCollectedLogs.length,
    tokensBurnedLogs: tokensBurnedLogs.length,
  })

  // Get unique block numbers to fetch timestamps
  const uniqueBlocks = new Set<bigint>()
  transferLogs.forEach((log) => uniqueBlocks.add(log.blockNumber))
  feesCollectedLogs.forEach((log) => uniqueBlocks.add(log.blockNumber))
  tokensBurnedLogs.forEach((log) => uniqueBlocks.add(log.blockNumber))

  // Fetch block timestamps (in batches to avoid rate limits)
  const blockTimestamps = new Map<bigint, number>()
  const blockNumbers = Array.from(uniqueBlocks)

  for (let i = 0; i < blockNumbers.length; i += 10) {
    const batch = blockNumbers.slice(i, i + 10)
    const blocks = await Promise.all(
      batch.map(async (blockNumber) => {
        try {
          const block = await publicClient.getBlock({ blockNumber })
          return { blockNumber, timestamp: Number(block.timestamp) }
        } catch (error) {
          console.error(`Failed to fetch block ${blockNumber}:`, error)
          return { blockNumber, timestamp: 0 }
        }
      })
    )
    blocks.forEach(({ blockNumber, timestamp }) => {
      blockTimestamps.set(blockNumber, timestamp)
    })

    // Small delay between batches
    if (i + 10 < blockNumbers.length) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  // Split Transfer events into regular transfers, burns, and mints
  const transfers: TransferEvent[] = []
  const burns: BurnTransferEvent[] = []
  const mints: MintEvent[] = []

  transferLogs.forEach((log) => {
    const from = log.args.from!
    const to = log.args.to!
    const amount = log.args.value!
    const fromLower = from.toLowerCase()
    const toLower = to.toLowerCase()
    const zeroLower = ZERO_ADDRESS.toLowerCase()

    // Check if the wallet is involved in this transfer
    const isWalletInvolved =
      walletAddresses.some((addr) => addr === fromLower) ||
      walletAddresses.some((addr) => addr === toLower)

    if (!isWalletInvolved) return

    // Categorize the transfer
    if (fromLower === zeroLower) {
      // Mint: from zero address to wallet
      mints.push({
        to,
        amount,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        timestamp: blockTimestamps.get(log.blockNumber) || 0,
      })
    } else if (toLower === zeroLower) {
      // Burn: from wallet to zero address
      burns.push({
        from,
        amount,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        timestamp: blockTimestamps.get(log.blockNumber) || 0,
      })
    } else {
      // Regular transfer: wallet to wallet
      transfers.push({
        from,
        to,
        amount,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        timestamp: blockTimestamps.get(log.blockNumber) || 0,
      })
    }
  })

  // Filter and transform FeesCollected events
  const feesCollected: FeesCollectedEvent[] = feesCollectedLogs
    .filter((log) => {
      const from = log.args.from?.toLowerCase()
      const to = log.args.to?.toLowerCase()
      return (
        walletAddresses.some((addr) => addr === from) ||
        walletAddresses.some((addr) => addr === to)
      )
    })
    .map((log) => ({
      from: log.args.from!,
      to: log.args.to!,
      amount: log.args.amount!,
      psbFee: log.args.psbFee!,
      importaFee: log.args.importaFee!,
      fgFee: log.args.fgFee!,
      transferType: log.args.transferType!,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      timestamp: blockTimestamps.get(log.blockNumber) || 0,
    }))

  // Filter and transform TokensBurned events
  const tokensBurned: TokensBurnedEvent[] = tokensBurnedLogs
    .filter((log) => {
      const from = log.args.from?.toLowerCase()
      return walletAddresses.some((addr) => addr === from)
    })
    .map((log) => ({
      from: log.args.from!,
      amount: log.args.amount!,
      burner: log.args.burner!,
      metadata: log.args.metadata!,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      timestamp: blockTimestamps.get(log.blockNumber) || 0,
    }))

  console.log('[useContractEvents] Filtered events:', {
    transfers: transfers.length,
    mints: mints.length,
    burns: burns.length,
    feesCollected: feesCollected.length,
    tokensBurned: tokensBurned.length,
  })

  return {
    transfers,
    mints,
    burns,
    feesCollected,
    tokensBurned,
  }
}

export const useContractEvents = (walletAddresses: Address[]) => {
  return useQuery({
    queryKey: ['contractEvents', walletAddresses],
    queryFn: () => fetchContractEvents(walletAddresses),
    enabled: walletAddresses.length > 0,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_CACHE_TIME,
    retry: 2,
  })
}
