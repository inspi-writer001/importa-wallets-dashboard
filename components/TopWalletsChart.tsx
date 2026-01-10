'use client'

import { useWallets } from '@/hooks/useWallets'
import { useContractEvents } from '@/hooks/useContractEvents'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { shortenAddress } from '@/lib/utils'
import { Address } from 'viem'
import { ShimmerLoader } from './ShimmerLoader'

export const TopWalletsChart = () => {
  const { data: wallets, isLoading: walletsLoading } = useWallets()
  const { data: events, isLoading: eventsLoading } = useContractEvents(wallets || [])

  const chartData = useMemo(() => {
    if (!events) return []

    // Count transactions per wallet (both as sender and receiver)
    const walletTxCount = new Map<Address, number>()

    events.transfers.forEach((event) => {
      const fromCount = walletTxCount.get(event.from) || 0
      const toCount = walletTxCount.get(event.to) || 0

      walletTxCount.set(event.from, fromCount + 1)
      walletTxCount.set(event.to, toCount + 1)
    })

    // Convert to array and sort by transaction count
    const sortedWallets = Array.from(walletTxCount.entries())
      .map(([address, count]) => ({
        address,
        count,
        displayAddress: shortenAddress(address),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 wallets

    return sortedWallets
  }, [events])

  const isLoading = walletsLoading || eventsLoading

  if (isLoading || !events) {
    return (
      <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Top Wallets by Transaction Count
        </h3>
        <ShimmerLoader variant="chart" />
      </div>
    )
  }

  return (
    <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
        Top Wallets by Transaction Count
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" className="stroke-light-border dark:stroke-dark-border" />
          <XAxis
            dataKey="displayAddress"
            className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '4px',
            }}
            labelFormatter={(value) => `Wallet: ${value}`}
            formatter={(value: number) => [value, 'Transactions']}
          />
          <Legend />
          <Bar dataKey="count" fill="#2563EB" name="Transaction Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
