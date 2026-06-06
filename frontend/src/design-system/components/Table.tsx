/**
 * Table - Modern data table component with sorting, filtering, and pagination
 */
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronDown, ChevronUp, ArrowUpDown, Search, Filter, MoreHorizontal } from 'lucide-react'
import { cn } from '../utils'
import { Button } from '../primitives/Button'
import { Input } from '../primitives/Input'
import { Badge } from '../primitives/Badge'

// Table variants
const tableVariants = cva(
  'w-full border-collapse',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-slate-200',
        striped: '',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

// Column definition interface
export interface ColumnDef<T> {
  key: string
  header: string | React.ReactNode
  accessor?: keyof T | ((row: T) => any)
  cell?: (row: T, value: any) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  className?: string
}

// Table props
export interface TableProps<T = any>
  extends React.TableHTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  emptyMessage?: string
  sortable?: boolean
  filterable?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
  }
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  onFilter?: (filters: Record<string, any>) => void
  selection?: {
    selectedRows: string[]
    onSelectionChange: (selectedRows: string[]) => void
    getRowId: (row: T) => string
  }
}

// Sort direction type
type SortDirection = 'asc' | 'desc' | null

const Table = <T extends Record<string, any>>({
  className,
  variant,
  size,
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  sortable = false,
  filterable = false,
  pagination,
  onSort,
  onFilter,
  selection,
  ...props
}: TableProps<T>) => {
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)
  const [filters, setFilters] = React.useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = React.useState('')

  // Handle sorting
  const handleSort = (key: string) => {
    if (!sortable || !onSort) return

    let newDirection: SortDirection = 'asc'
    if (sortKey === key) {
      newDirection = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc'
    }

    setSortKey(newDirection ? key : null)
    setSortDirection(newDirection)

    if (newDirection) {
      onSort(key, newDirection)
    }
  }

  // Handle filtering
  const handleFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    if (!value) {
      delete newFilters[key]
    }
    setFilters(newFilters)
    onFilter?.(newFilters)
  }

  // Get cell value
  const getCellValue = (row: T, column: ColumnDef<T>) => {
    if (column.accessor) {
      if (typeof column.accessor === 'function') {
        return column.accessor(row)
      }
      return row[column.accessor]
    }
    return row[column.key]
  }

  // Render sort icon
  const renderSortIcon = (key: string) => {
    if (!sortable) return null
    
    if (sortKey === key) {
      return sortDirection === 'asc' ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )
    }
    
    return <ArrowUpDown className="h-4 w-4 opacity-50" />
  }

  // Handle row selection
  const handleRowSelect = (rowId: string, checked: boolean) => {
    if (!selection) return
    
    const newSelection = checked
      ? [...selection.selectedRows, rowId]
      : selection.selectedRows.filter(id => id !== rowId)
    
    selection.onSelectionChange(newSelection)
  }

  const handleSelectAll = (checked: boolean) => {
    if (!selection) return
    
    const newSelection = checked
      ? data.map(row => selection.getRowId(row))
      : []
    
    selection.onSelectionChange(newSelection)
  }

  const isAllSelected = selection && selection.selectedRows.length === data.length
  const isPartiallySelected = selection && selection.selectedRows.length > 0 && selection.selectedRows.length < data.length

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      {(filterable || searchQuery !== undefined) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-2">
            {filterable && (
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="max-w-xs"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Filter className="h-4 w-4" />}>
              Filters
            </Button>
            <Button variant="ghost" size="sm" icon={<MoreHorizontal className="h-4 w-4" />} />
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-sm text-slate-600">Loading...</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className={cn(tableVariants({ variant, size, className }))} {...props}>
            {/* Table Header */}
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {selection && (
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isPartiallySelected
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide',
                      column.sortable && sortable && 'cursor-pointer select-none hover:bg-slate-100',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.className
                    )}
                    style={column.width ? { width: column.width } : undefined}
                    onClick={() => column.sortable && sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selection ? 1 : 0)} 
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => {
                  const rowId = selection?.getRowId(row)
                  const isSelected = selection && rowId && selection.selectedRows.includes(rowId)
                  
                  return (
                    <tr
                      key={rowId || rowIndex}
                      className={cn(
                        'hover:bg-slate-50 transition-colors',
                        isSelected && 'bg-primary-50 hover:bg-primary-100',
                        variant === 'striped' && rowIndex % 2 === 1 && 'bg-slate-50'
                      )}
                    >
                      {selection && rowId && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                      )}
                      {columns.map((column) => {
                        const value = getCellValue(row, column)
                        const cellContent = column.cell ? column.cell(row, value) : value

                        return (
                          <td
                            key={column.key}
                            className={cn(
                              'px-4 py-3 text-sm text-slate-900',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right',
                              column.className
                            )}
                          >
                            {cellContent}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }, (_, i) => {
                    const pageNum = pagination.page - 2 + i
                    if (pageNum < 1 || pageNum > Math.ceil(pagination.total / pagination.pageSize)) return null
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => pagination.onPageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

Table.displayName = 'Table'

export { Table, tableVariants }