'use client'

import { useWallets } from '@/hooks/useWallets'
import { useContractEvents } from '@/hooks/useContractEvents'
import { useMemo, useState } from 'react'
import { formatTokenAmount, shortenAddress } from '@/lib/utils'
import { formatUnits } from 'viem'
import { TOKEN_DECIMALS } from '@/lib/constants'

export const TransactionsTable = () => {
  const { data: wallets } = useWallets()
  const { data: events, isLoading } = useContractEvents(wallets || [])

  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredTransactions = useMemo(() => {
    if (!events) return []

    let filtered = [...events.metaTransfers]

    // Apply amount filters
    if (minAmount) {
      const minBigInt = BigInt(Math.floor(parseFloat(minAmount) * 10 ** TOKEN_DECIMALS))
      filtered = filtered.filter((tx) => tx.amount >= minBigInt)
    }

    if (maxAmount) {
      const maxBigInt = BigInt(Math.floor(parseFloat(maxAmount) * 10 ** TOKEN_DECIMALS))
      filtered = filtered.filter((tx) => tx.amount <= maxBigInt)
    }

    // Sort by block number (most recent first)
    return filtered.sort((a, b) => Number(b.blockNumber - a.blockNumber))
  }, [events, minAmount, maxAmount])

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTransactions, currentPage])

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Recent Transactions
        </h3>
        <div className="h-96 w-full bg-light-border dark:bg-dark-border animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="p-6 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
        Recent Transactions
      </h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="minAmount"
            className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary"
          >
            Min Amount
          </label>
          <input
            id="minAmount"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="0"
            className="px-3 py-2 rounded border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="maxAmount"
            className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary"
          >
            Max Amount
          </label>
          <input
            id="maxAmount"
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            placeholder="∞"
            className="px-3 py-2 rounded border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
          />
        </div>
        {(minAmount || maxAmount) && (
          <button
            onClick={() => {
              setMinAmount('')
              setMaxAmount('')
              setCurrentPage(1)
            }}
            className="self-end px-4 py-2 rounded border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary text-sm hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border">
              <th className="text-left py-3 px-4 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Block
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                From
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                To
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Type
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Relayer
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Nonce
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-light-text-tertiary dark:text-dark-text-tertiary">
                  No transactions found
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx, index) => (
                <tr
                  key={`${tx.transactionHash}-${index}`}
                  className="border-b border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-light-text-primary dark:text-dark-text-primary">
                    {tx.blockNumber.toString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-light-text-primary dark:text-dark-text-primary">
                    {shortenAddress(tx.from)}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-light-text-primary dark:text-dark-text-primary">
                    {shortenAddress(tx.to)}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {formatTokenAmount(tx.amount, 4)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.isPlatformTransfer
                          ? 'bg-light-success/10 text-light-success dark:bg-dark-success/10 dark:text-dark-success'
                          : 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/10 dark:text-dark-primary'
                      }`}
                    >
                      {tx.isPlatformTransfer ? 'Internal' : 'External'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-light-text-primary dark:text-dark-text-primary">
                    {shortenAddress(tx.relayer)}
                  </td>
                  <td className="py-3 px-4 text-sm text-light-text-primary dark:text-dark-text-primary">
                    {tx.nonce.toString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
            {filteredTransactions.length} transactions
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary text-sm hover:bg-light-border dark:hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-light-text-primary dark:text-dark-text-primary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary text-sm hover:bg-light-border dark:hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
