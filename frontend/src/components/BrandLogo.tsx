import React from 'react'
import { Link } from 'react-router-dom'
import { Truck } from 'lucide-react'
import clsx from 'clsx'

interface BrandLogoProps {
  to?: string
  variant?: 'light' | 'dark'
  className?: string
  onClick?: () => void
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
  variant = 'light',
  className,
  onClick,
}) => {
  const isDark = variant === 'dark'

  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        'group/brand inline-flex items-center gap-3 rounded-lg transition-transform duration-200 hover:scale-105',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4',
        isDark && 'focus-visible:ring-offset-slate-950',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/30 transition-all duration-300 group-hover/brand:from-primary-700 group-hover/brand:to-primary-800 group-hover/brand:shadow-xl">
        <Truck className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p
          className={clsx(
            'text-base font-bold tracking-tight transition-colors duration-200',
            isDark ? 'text-white' : 'text-slate-950 group-hover/brand:text-primary-700',
          )}
        >
          ARMS
        </p>
        <p
          className={clsx(
            'text-[10px] font-medium uppercase leading-tight tracking-[0.16em] transition-colors duration-200',
            isDark ? 'text-slate-400 group-hover/brand:text-slate-200' : 'text-slate-500 group-hover/brand:text-slate-700',
          )}
        >
          Automated Refuse Management
        </p>
      </div>
    </Link>
  )
}

export default BrandLogo
