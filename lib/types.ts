import { Address } from 'viem'

export enum TransferType {
  IMPORTA_TO_IMPORTA = 0,
  IMPORTA_TO_EXTERNAL = 1,
}

export interface BurnMetadata {
  destinationBankCode: string
  destinationName: string
  destinationBankAccountNumber: string
  senderAccountNumber: string
  narration: string
  senderName: string
  fromLocation: string
  txAmount: bigint
}

export interface FeeStructure {
  psbFeeRate: bigint
  psbFeeCap: bigint
  psbFlatFee: bigint
  importaFee: bigint
  fgFeeRate: bigint
  fgFeeBonus: bigint
  fgThreshold: bigint
  normalTransferFee: bigint
}

export interface TransferEvent {
  from: Address
  to: Address
  amount: bigint
  blockNumber: bigint
  transactionHash: `0x${string}`
  timestamp: number
}

export interface MintEvent {
  to: Address
  amount: bigint
  blockNumber: bigint
  transactionHash: `0x${string}`
  timestamp: number
}

export interface BurnTransferEvent {
  from: Address
  amount: bigint
  blockNumber: bigint
  transactionHash: `0x${string}`
  timestamp: number
}

export interface FeesCollectedEvent {
  from: Address
  to: Address
  amount: bigint
  psbFee: bigint
  importaFee: bigint
  fgFee: bigint
  transferType: TransferType
  blockNumber: bigint
  transactionHash: `0x${string}`
  timestamp: number
}

export interface TokensBurnedEvent {
  from: Address
  amount: bigint
  burner: Address
  metadata: BurnMetadata
  blockNumber: bigint
  transactionHash: `0x${string}`
  timestamp: number
}

export interface MetaTransferEvent {
  from: Address
  to: Address
  amount: bigint
  isPlatformTransfer: boolean
  relayer: Address
  nonce: bigint
  blockNumber: bigint
  transactionHash: `0x${string}`
  timestamp: number
}

export interface WalletsApiResponse {
  response: string[]
}

export interface DashboardMetrics {
  totalActiveWallets: number
  totalTransfers24h: number
  totalVolumeProcessed: bigint
  totalFeesBurned: bigint
}

export interface ChartDataPoint {
  timestamp: number
  date: string
  volume: number
  count: number
}

export interface FeeBreakdown {
  psbFee: number
  importaFee: number
  fgFee: number
}

export interface TransferTypeDistribution {
  name: string
  value: number
  count: number
}
