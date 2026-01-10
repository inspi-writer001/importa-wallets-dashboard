'use client'

import { CONTRACT_ADDRESS, PROXY_ADDRESS } from '@/lib/constants'
import { shortenAddress } from '@/lib/utils'
import { useWallets } from '@/hooks/useWallets'
import { useContractEvents } from '@/hooks/useContractEvents'
import { useMemo } from 'react'

interface ContractLinkProps {
  label: string
  address: string
  type: 'contract' | 'account'
}

const ContractLink = ({ label, address, type }: ContractLinkProps) => {
  const url = `https://hashscan.io/mainnet/${type}/${address}`

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
        {label}
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm text-light-primary dark:text-dark-primary hover:underline flex items-center gap-2"
      >
        {shortenAddress(address as `0x${string}`)}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  )
}

export const ContractInfo = () => {
  const { data: wallets } = useWallets()
  const { data: events, isLoading } = useContractEvents(wallets || [])

  const mostRecentRelayer = useMemo(() => {
    if (!events || events.metaTransfers.length === 0) return null

    // Get the most recent transaction's relayer
    const sortedTransfers = [...events.metaTransfers].sort(
      (a, b) => Number(b.blockNumber - a.blockNumber)
    )

    return sortedTransfers[0]?.relayer
  }, [events])

  return (
    <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
        Contract Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ContractLink
          label="Contract Address"
          address={CONTRACT_ADDRESS}
          type="contract"
        />
        <ContractLink
          label="Proxy Address"
          address={PROXY_ADDRESS}
          type="contract"
        />
        {isLoading ? (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Recent Relayer
            </span>
            <div className="h-5 w-32 bg-light-border dark:bg-dark-border animate-pulse rounded" />
          </div>
        ) : mostRecentRelayer ? (
          <ContractLink
            label="Recent Relayer"
            address={mostRecentRelayer}
            type="account"
          />
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Recent Relayer
            </span>
            <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
              No recent transactions
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
