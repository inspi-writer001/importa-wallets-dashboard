'use client'

import { Header } from '@/components/Header'
import { SummaryCards } from '@/components/SummaryCards'
import { VolumeChart } from '@/components/VolumeChart'
import { TransferTypeChart } from '@/components/TransferTypeChart'
import { TopWalletsChart } from '@/components/TopWalletsChart'
import { TransactionCountChart } from '@/components/TransactionCountChart'
import { ContractInfo } from '@/components/ContractInfo'
import { TransactionsTable } from '@/components/TransactionsTable'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Contract Information */}
          <section>
            <ContractInfo />
          </section>

          {/* Summary Cards */}
          <section>
            <SummaryCards />
          </section>

          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VolumeChart />
            <TransferTypeChart />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopWalletsChart />
            <TransactionCountChart />
          </section>

          {/* Transactions Table */}
          <section>
            <TransactionsTable />
          </section>
        </div>
      </main>

      <footer className="border-t border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
          <p>tNGN Dashboard - Built with Next.js, TypeScript, and Viem</p>
        </div>
      </footer>
    </div>
  )
}
