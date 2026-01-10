'use client'

import { useWallets } from '@/hooks/useWallets'
import { useContractEvents } from '@/hooks/useContractEvents'
import { useTotalSupply } from '@/hooks/useTotalSupply'
import { formatTokenAmount, formatNumber } from '@/lib/utils'
import { useMemo } from 'react'
import { ShimmerLoader } from './ShimmerLoader'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  isLoading?: boolean
}

const StatCard = ({ title, value, subtitle, isLoading }: StatCardProps) => {
  return (
    <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
      <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
        {title}
      </h3>
      {isLoading ? (
        <ShimmerLoader variant="card" />
      ) : (
        <>
          <p className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
              {subtitle}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export const SummaryCards = () => {
  const { data: wallets, isLoading: walletsLoading } = useWallets()
  const { data: events, isLoading: eventsLoading } = useContractEvents(wallets || [])
  const { data: totalSupply, isLoading: totalSupplyLoading } = useTotalSupply()

  const metrics = useMemo(() => {
    if (!events) {
      return {
        totalActiveWallets: 0,
        totalMetaTransfers24h: 0,
        totalVolumeProcessed: 0n,
        totalDeposits: 0,
      }
    }

    const now = Date.now() / 1000
    const oneDayAgo = now - 24 * 60 * 60

    // Filter events from last 24 hours using actual timestamps
    const recentTransfers = events.metaTransfers.filter((event) => {
      return event.timestamp >= oneDayAgo
    })

    const totalVolume = events.metaTransfers.reduce(
      (sum, event) => sum + event.amount,
      0n
    )

    return {
      totalActiveWallets: wallets?.length || 0,
      totalMetaTransfers24h: recentTransfers.length,
      totalVolumeProcessed: totalVolume,
      totalDeposits: events.tokensDeposited.length,
    }
  }, [events, wallets])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Active Wallets"
        value={formatNumber(metrics.totalActiveWallets)}
        subtitle="Tracked wallets"
        isLoading={walletsLoading}
      />
      <StatCard
        title="MetaTransfers (24h)"
        value={formatNumber(metrics.totalMetaTransfers24h)}
        subtitle="Last 24 hours"
        isLoading={eventsLoading}
      />
      <StatCard
        title="Total Volume"
        value={formatTokenAmount(metrics.totalVolumeProcessed)}
        subtitle="tNGN transferred"
        isLoading={eventsLoading}
      />
      <StatCard
        title="Circulating Supply"
        value={formatTokenAmount(totalSupply || 0n)}
        subtitle="Total tNGN in circulation"
        isLoading={totalSupplyLoading}
      />
    </div>
  )
}
