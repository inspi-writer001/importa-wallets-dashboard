'use client'

import { useWallets } from '@/hooks/useWallets'
import { useContractEvents } from '@/hooks/useContractEvents'
import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { TransferType } from '@/lib/types'

const COLORS = {
  [TransferType.IMPORTA_TO_IMPORTA]: '#10B981',
  [TransferType.IMPORTA_TO_EXTERNAL]: '#3B82F6',
}

export const TransferTypeChart = () => {
  const { data: wallets } = useWallets()
  const { data: events, isLoading } = useContractEvents(wallets || [])

  const chartData = useMemo(() => {
    if (!events) return []

    const typeCounts = new Map<TransferType, number>()

    events.feesCollected.forEach((event) => {
      const count = typeCounts.get(event.transferType) || 0
      typeCounts.set(event.transferType, count + 1)
    })

    return [
      {
        name: 'Importa Internal',
        value: typeCounts.get(TransferType.IMPORTA_TO_IMPORTA) || 0,
        type: TransferType.IMPORTA_TO_IMPORTA,
      },
      {
        name: 'Importa to External',
        value: typeCounts.get(TransferType.IMPORTA_TO_EXTERNAL) || 0,
        type: TransferType.IMPORTA_TO_EXTERNAL,
      },
    ].filter((item) => item.value > 0)
  }, [events])

  if (isLoading) {
    return (
      <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Transfer Type Distribution
        </h3>
        <div className="h-80 w-full bg-light-border dark:bg-dark-border animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
        Transfer Type Distribution
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.type}`} fill={COLORS[entry.type]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '4px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
