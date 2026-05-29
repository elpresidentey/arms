import React from 'react'
import clsx from 'clsx'

interface SurfaceProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const Surface: React.FC<SurfaceProps> = ({ title, subtitle, action, children, className }) => {
  return (
    <section
      className={clsx(
        'panel-shell rounded-xl',
        'border border-slate-200/80 bg-white',
        'shadow-sm transition-colors duration-200 hover:border-slate-300/80',
        className,
      )}
    >
      <div className="flex flex-col gap-2.5 border-b border-slate-200/70 bg-slate-50/55 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
        <div className="min-w-0">
          <h2 className="heading-3">{title}</h2>
          {subtitle && <p className="mt-1 max-w-2xl body-small text-slate-600">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-3.5 sm:p-5 lg:p-6">{children}</div>
    </section>
  )
}

export default Surface
