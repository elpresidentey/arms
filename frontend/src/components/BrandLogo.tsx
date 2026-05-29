import React from 'react'
import { Link } from 'react-router-dom'
import { Truck } from 'lucide-react'
import clsx from 'clsx'

interface BrandLogoProps {
  to?: string
  variant?: 'light' | 'dark'
  density?: 'full' | 'compact'
  className?: string
  onClick?: () => void
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
  variant = 'light',
  density = 'full',
  className,
  onClick,
}) => {
  const isDark = variant === 'dark'
  const isCompact = density === 'compact'

  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        'group/brand inline-flex items-center rounded-lg transition-transform duration-200 hover:scale-[1.01]',
        isCompact ? 'gap-2.5' : 'gap-3',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4',
        isDark && 'focus-visible:ring-offset-slate-950',
        className,
      )}
    >
      <div
        className={clsx(
          'flex shrink-0 items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-sm shadow-primary-600/20 transition-colors duration-200 group-hover/brand:from-primary-700 group-hover/brand:to-primary-900',
          isCompact ? 'h-9 w-9 rounded-lg' : 'h-11 w-11 rounded-xl',
        )}
      >
        <Truck className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={clsx(
            'font-bold tracking-tight transition-colors duration-200',
            isCompact ? 'text-sm' : 'text-base',
            isDark ? 'text-white' : 'text-slate-950 group-hover/brand:text-primary-700',
          )}
        >
          ARMS
        </p>
        {!isCompact ? (
          <p
            className={clsx(
              'whitespace-normal break-words text-[10px] font-medium uppercase leading-[1.18] tracking-[0.14em] transition-colors duration-200',
              isDark ? 'text-slate-400 group-hover/brand:text-slate-200' : 'text-slate-500 group-hover/brand:text-slate-700',
            )}
          >
            Automated Refuse Management
          </p>
        ) : null}
      </div>
    </Link>
  )
}

export default BrandLogo
