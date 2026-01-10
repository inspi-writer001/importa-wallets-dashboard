'use client'

import { useWallets } from '@/hooks/useWallets'
import { useContractEvents } from '@/hooks/useContractEvents'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatDate } from '@/lib/utils'
import { ShimmerLoader } from './ShimmerLoader'

export const TransactionCountChart = () => {
  const { data: wallets, isLoading: walletsLoading } = useWallets()
  const { data: events, isLoading: eventsLoading } = useContractEvents(wallets || [])

  const chartData = useMemo(() => {
    if (!events) return []

    // Group transactions by day
    const countByDay = new Map<string, { count: number; timestamp: number }>()

    events.metaTransfers.forEach((event) => {
      const date = formatDate(event.timestamp)

      const existing = countByDay.get(date) || { count: 0, timestamp: event.timestamp }
      countByDay.set(date, {
        count: existing.count + 1,
        timestamp: existing.timestamp,
      })
    })

    // Convert to array and sort by timestamp
    return Array.from(countByDay.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        timestamp: data.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [events])

  const isLoading = walletsLoading || eventsLoading

  if (isLoading || !events) {
    return (
      <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Transaction Count Over Time
        </h3>
        <ShimmerLoader variant="chart" />
      </div>
    )
  }

  return (
    <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
        Transaction Count Over Time
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-light-border dark:stroke-dark-border" />
          <XAxis
            dataKey="date"
            className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
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
            formatter={(value: number) => [value, 'Transactions']}
          />
          <Legend />
          <Bar dataKey="count" fill="#10B981" name="Transaction Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
