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
  MetaTransferExecutedEvent,
  FeesCollectedEvent,
  TokensBurnedEvent,
  TokensDepositedEvent,
} from '@/lib/types'

interface ContractEventsData {
  metaTransfers: MetaTransferExecutedEvent[]
  feesCollected: FeesCollectedEvent[]
  tokensBurned: TokensBurnedEvent[]
  tokensDeposited: TokensDepositedEvent[]
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
      metaTransfers: [],
      feesCollected: [],
      tokensBurned: [],
      tokensDeposited: [],
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

  // Fetch MetaTransferExecuted events in batches
  const metaTransferLogs = await processBatches(chunks, (chunk) =>
    publicClient.getLogs({
      address: PROXY_ADDRESS,
      event: tNGN_ABI.find((e) => e.type === 'event' && e.name === 'MetaTransferExecuted')!,
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

  // Fetch Transfer events (mints) where from is address(0) in batches
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address
  const transferMintLogs = await processBatches(chunks, (chunk) =>
    publicClient.getLogs({
      address: PROXY_ADDRESS,
      event: tNGN_ABI.find((e) => e.type === 'event' && e.name === 'Transfer')!,
      args: { from: ZERO_ADDRESS },
      fromBlock: chunk.from,
      toBlock: chunk.to,
    })
  )

  console.log('[useContractEvents] Raw logs fetched:', {
    metaTransferLogs: metaTransferLogs.length,
    feesCollectedLogs: feesCollectedLogs.length,
    tokensBurnedLogs: tokensBurnedLogs.length,
    transferMintLogs: transferMintLogs.length,
  })

  // Get unique block numbers to fetch timestamps
  const uniqueBlocks = new Set<bigint>()
  metaTransferLogs.forEach((log) => uniqueBlocks.add(log.blockNumber))
  feesCollectedLogs.forEach((log) => uniqueBlocks.add(log.blockNumber))
  tokensBurnedLogs.forEach((log) => uniqueBlocks.add(log.blockNumber))
  transferMintLogs.forEach((log) => uniqueBlocks.add(log.blockNumber))

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

  // Filter and transform MetaTransferExecuted events
  const metaTransfers: MetaTransferExecutedEvent[] = metaTransferLogs
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
      isPlatformTransfer: log.args.isPlatformTransfer!,
      relayer: log.args.relayer!,
      nonce: log.args.nonce!,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      timestamp: blockTimestamps.get(log.blockNumber) || 0,
    }))

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

  // Filter and transform Transfer (mint/deposit) events
  const tokensDeposited: TokensDepositedEvent[] = transferMintLogs
    .filter((log) => {
      const to = log.args.to?.toLowerCase()
      return walletAddresses.some((addr) => addr === to)
    })
    .map((log) => ({
      to: log.args.to!,
      amount: log.args.value!,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      timestamp: blockTimestamps.get(log.blockNumber) || 0,
    }))

  console.log('[useContractEvents] Filtered events:', {
    metaTransfers: metaTransfers.length,
    feesCollected: feesCollected.length,
    tokensBurned: tokensBurned.length,
    tokensDeposited: tokensDeposited.length,
  })

  return {
    metaTransfers,
    feesCollected,
    tokensBurned,
    tokensDeposited,
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
