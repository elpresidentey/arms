import React from 'react'
import clsx from 'clsx'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
  animate?: boolean
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines,
  animate = true,
}) => {
  const baseClasses = clsx(
    'bg-slate-200',
    {
      'animate-pulse': animate,
      'rounded-full': variant === 'circular',
      'rounded-lg': variant === 'rectangular',
      'rounded-[1.1rem]': variant === 'rounded',
      'h-4 w-full': variant === 'text' && !width && !height,
    },
    className
  )

  const style = {
    width: width || 'auto',
    height: height || 'auto',
  }

  if (variant === 'text' && lines && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={clsx(
              baseClasses,
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={style}
          />
        ))}
      </div>
    )
  }

  return <div className={baseClasses} style={style} />
}

// Specialized skeleton components
export const StatsCardSkeleton: React.FC = () => (
  <div className="rounded-[1.7rem] border border-black/5 bg-[#fffdf9]/95 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.05)] sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="80%" height={32} className="mt-3" />
      </div>
      <Skeleton variant="circular" width={44} height={44} />
    </div>
  </div>
)

export const SurfaceSkeleton: React.FC<{ showTitle?: boolean }> = ({ showTitle = true }) => (
  <section className="rounded-[1.8rem] border border-black/5 bg-[#fffdf9]/95 shadow-[0_24px_45px_rgba(15,23,42,0.05)]">
    {showTitle && (
      <div className="flex flex-col gap-3 border-b border-black/5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Skeleton variant="text" width={120} height={20} />
          <Skeleton variant="text" width={200} height={16} className="mt-1" />
        </div>
      </div>
    )}
    <div className="p-5 sm:p-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={36} height={36} />
          <div className="flex-1">
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="text" width="40%" height={12} className="mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={36} height={36} />
          <div className="flex-1">
            <Skeleton variant="text" width="70%" height={16} />
            <Skeleton variant="text" width="30%" height={12} className="mt-1" />
          </div>
        </div>
      </div>
    </div>
  </section>
)

export const ActivitySkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <Skeleton variant="circular" width={36} height={36} />
      <div className="min-w-0 flex-1">
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={12} className="mt-1" />
      </div>
      <Skeleton variant="rounded" width={60} height={24} />
    </div>
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <Skeleton variant="circular" width={36} height={36} />
      <div className="min-w-0 flex-1">
        <Skeleton variant="text" width="70%" height={16} />
        <Skeleton variant="text" width="30%" height={12} className="mt-1" />
      </div>
      <Skeleton variant="rounded" width={60} height={24} />
    </div>
  </div>
)

export const TimelineSkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width={36} height={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Skeleton variant="text" width="70%" height={16} />
            <Skeleton variant="rounded" width={80} height={24} />
          </div>
          <Skeleton variant="text" width="50%" height={12} className="mt-1" />
        </div>
      </div>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width={36} height={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="rounded" width={80} height={24} />
          </div>
          <Skeleton variant="text" width="40%" height={12} className="mt-1" />
        </div>
      </div>
    </div>
  </div>
)

export default Skeleton
