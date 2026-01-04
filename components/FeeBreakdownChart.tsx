'use client'

import { useWallets } from '@/hooks/useWallets'
import { useContractEvents } from '@/hooks/useContractEvents'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatUnits } from 'viem'
import { TOKEN_DECIMALS } from '@/lib/constants'

export const FeeBreakdownChart = () => {
  const { data: wallets } = useWallets()
  const { data: events, isLoading } = useContractEvents(wallets || [])

  const chartData = useMemo(() => {
    if (!events) return []

    const totals = events.feesCollected.reduce(
      (acc, event) => ({
        psbFee: acc.psbFee + parseFloat(formatUnits(event.psbFee, TOKEN_DECIMALS)),
        importaFee: acc.importaFee + parseFloat(formatUnits(event.importaFee, TOKEN_DECIMALS)),
        fgFee: acc.fgFee + parseFloat(formatUnits(event.fgFee, TOKEN_DECIMALS)),
      }),
      { psbFee: 0, importaFee: 0, fgFee: 0 }
    )

    return [
      {
        name: 'Fee Breakdown',
        'PSB Fee': totals.psbFee,
        'Importa Fee': totals.importaFee,
        'FG Fee': totals.fgFee,
      },
    ]
  }, [events])

  if (isLoading) {
    return (
      <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Fee Breakdown
        </h3>
        <div className="h-80 w-full bg-light-border dark:bg-dark-border animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
        Fee Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-light-border dark:stroke-dark-border" />
          <XAxis
            dataKey="name"
            className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
          />
          <YAxis
            className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '4px',
            }}
            formatter={(value: number) => value.toFixed(2)}
          />
          <Legend />
          <Bar dataKey="PSB Fee" fill="#2563EB" />
          <Bar dataKey="Importa Fee" fill="#10B981" />
          <Bar dataKey="FG Fee" fill="#F59E0B" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
