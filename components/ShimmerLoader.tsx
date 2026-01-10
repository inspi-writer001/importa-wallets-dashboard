interface ShimmerLoaderProps {
  className?: string
  variant?: 'card' | 'chart' | 'text' | 'table'
}

export const ShimmerLoader = ({ className = '', variant = 'card' }: ShimmerLoaderProps) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-light-border via-light-surface to-light-border dark:from-dark-border dark:via-dark-surface dark:to-dark-border bg-[length:200%_100%] shimmer'

  switch (variant) {
    case 'chart':
      return <div className={`h-80 w-full rounded ${baseClasses} ${className}`} />
    case 'text':
      return <div className={`h-8 w-full rounded ${baseClasses} ${className}`} />
    case 'table':
      return (
        <div className="space-y-3">
          <div className={`h-12 w-full rounded ${baseClasses}`} />
          <div className={`h-12 w-full rounded ${baseClasses}`} />
          <div className={`h-12 w-full rounded ${baseClasses}`} />
          <div className={`h-12 w-full rounded ${baseClasses}`} />
        </div>
      )
    case 'card':
    default:
      return (
        <div className="space-y-3">
          <div className={`h-4 w-24 rounded ${baseClasses}`} />
          <div className={`h-8 w-32 rounded ${baseClasses}`} />
          <div className={`h-3 w-20 rounded ${baseClasses}`} />
        </div>
      )
  }
}
