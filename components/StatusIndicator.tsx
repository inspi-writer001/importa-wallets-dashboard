'use client'

import { useRpcStatus } from '@/hooks/useRpcStatus'

export const StatusIndicator = () => {
  const { data: isConnected, isLoading } = useRpcStatus()

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
      <div
        className={`w-2 h-2 rounded-full ${
          isLoading
            ? 'bg-light-warning dark:bg-dark-warning animate-pulse'
            : isConnected
            ? 'bg-light-success dark:bg-dark-success'
            : 'bg-light-error dark:bg-dark-error'
        }`}
      />
      <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
        {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
}
