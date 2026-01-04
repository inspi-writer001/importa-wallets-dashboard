'use client'

import { ThemeToggle } from './ThemeToggle'
import { StatusIndicator } from './StatusIndicator'

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-light-primary dark:bg-dark-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">tN</span>
              </div>
              <h1 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                tNGN Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusIndicator />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
