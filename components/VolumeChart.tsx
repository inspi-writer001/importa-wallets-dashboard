'use client'

import { useWallets } from '@/hooks/useWallets'
import { useContractEvents } from '@/hooks/useContractEvents'
import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatTokenAmount, formatDate } from '@/lib/utils'
import { formatUnits } from 'viem'
import { TOKEN_DECIMALS } from '@/lib/constants'
import { ShimmerLoader } from './ShimmerLoader'

export const VolumeChart = () => {
  const { data: wallets } = useWallets()
  const { data: events, isLoading } = useContractEvents(wallets || [])

  const chartData = useMemo(() => {
    if (!events) return []

    // Group transfers by day
    const volumeByDay = new Map<string, { volume: number; count: number; timestamp: number }>()

    events.transfers.forEach((event) => {
      const date = formatDate(event.timestamp)

      const existing = volumeByDay.get(date) || { volume: 0, count: 0, timestamp: event.timestamp }
      volumeByDay.set(date, {
        volume: existing.volume + parseFloat(formatUnits(event.amount, TOKEN_DECIMALS)),
        count: existing.count + 1,
        timestamp: existing.timestamp,
      })
    })

    // Convert to array and sort by timestamp
    return Array.from(volumeByDay.entries())
      .map(([date, data]) => ({
        date,
        volume: data.volume,
        count: data.count,
        timestamp: data.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [events])

  if (isLoading || !events) {
    return (
      <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Transaction Volume Over Time
        </h3>
        <ShimmerLoader variant="chart" />
      </div>
    )
  }

  return (
    <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
        Transaction Volume Over Time
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-light-border dark:stroke-dark-border" />
          <XAxis
            dataKey="date"
            className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
          />
          <YAxis
            className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
            tickFormatter={(value) => formatTokenAmount(BigInt(Math.floor(value * 10 ** TOKEN_DECIMALS)))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '4px',
            }}
            labelStyle={{ color: 'var(--tooltip-text)' }}
            formatter={(value: number) => [
              formatTokenAmount(BigInt(Math.floor(value * 10 ** TOKEN_DECIMALS))),
              'Volume',
            ]}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#2563EB"
            fill="#2563EB"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
