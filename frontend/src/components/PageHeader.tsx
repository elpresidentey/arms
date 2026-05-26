import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  action?: React.ReactNode
  stats?: React.ReactNode
  meta?: React.ReactNode
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  eyebrow,
  action,
  stats,
  meta,
}) => {
  const footer = meta ?? stats

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <p className="caption text-primary-700">{eyebrow}</p>
          )}
          <h1 className={`heading-1 text-balance ${eyebrow ? 'mt-1.5' : ''}`}>
            {title}
          </h1>
          {description && <p className="mt-1.5 max-w-2xl body text-slate-600">{description}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {footer && <div>{footer}</div>}
    </div>
  )
}

export default PageHeader
