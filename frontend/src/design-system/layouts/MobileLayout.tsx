/**
 * MobileLayout - Mobile-first responsive layout system
 */
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'

// Stack Layout (vertical arrangement)
const stackVariants = cva('flex flex-col', {
  variants: {
    gap: {
      none: '',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
      '2xl': 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'stretch',
    justify: 'start',
  },
})

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, gap, align, justify, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(stackVariants({ gap, align, justify, className }))}
        {...props}
      />
    )
  },
)

Stack.displayName = 'Stack'

// Inline Layout (horizontal arrangement)
const inlineVariants = cva('flex flex-row', {
  variants: {
    gap: {
      none: '',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
      '2xl': 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'center',
    justify: 'start',
    wrap: false,
  },
})

export interface InlineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inlineVariants> {}

export const Inline = React.forwardRef<HTMLDivElement, InlineProps>(
  ({ className, gap, align, justify, wrap, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(inlineVariants({ gap, align, justify, wrap, className }))}
        {...props}
      />
    )
  },
)

Inline.displayName = 'Inline'

// Grid Layout (responsive grid system)
const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
      auto: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
    },
    gap: {
      none: '',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
      '2xl': 'gap-8',
    },
  },
  defaultVariants: {
    cols: 'auto',
    gap: 'md',
  },
})

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(gridVariants({ cols, gap, className }))}
        {...props}
      />
    )
  },
)

Grid.displayName = 'Grid'

// Container Layout (content width constraints)
const containerVariants = cva('mx-auto w-full', {
  variants: {
    maxWidth: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
      none: '',
    },
    padding: {
      none: '',
      sm: 'px-4',
      md: 'px-4 sm:px-6',
      lg: 'px-4 sm:px-6 lg:px-8',
    },
  },
  defaultVariants: {
    maxWidth: 'xl',
    padding: 'lg',
  },
})

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ maxWidth, padding, className }))}
        {...props}
      />
    )
  },
)

Container.displayName = 'Container'

// Section Layout (semantic content sections)
const sectionVariants = cva('', {
  variants: {
    spacing: {
      xs: 'py-4',
      sm: 'py-6',
      md: 'py-8',
      lg: 'py-12',
      xl: 'py-16',
      '2xl': 'py-20',
    },
    background: {
      none: '',
      white: 'bg-white',
      muted: 'bg-slate-50',
      primary: 'bg-primary-50',
    },
  },
  defaultVariants: {
    spacing: 'lg',
    background: 'none',
  },
})

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing, background, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(sectionVariants({ spacing, background, className }))}
        {...props}
      />
    )
  },
)

Section.displayName = 'Section'

// Sidebar Layout (main content + sidebar)
export interface SidebarLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  sidebarPosition?: 'left' | 'right'
  sidebarWidth?: string
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export const SidebarLayout = React.forwardRef<HTMLDivElement, SidebarLayoutProps>(
  ({ 
    children, 
    sidebar, 
    sidebarPosition = 'left',
    sidebarWidth = '280px',
    className,
    collapsible = false,
    defaultCollapsed = false,
    ...props 
  }, ref) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

    const sidebarStyle = {
      [sidebarPosition === 'left' ? 'marginLeft' : 'marginRight']: 
        collapsible && collapsed ? '0' : sidebarWidth,
    }

    return (
      <div ref={ref} className={cn('min-h-screen bg-slate-50', className)} {...props}>
        {/* Sidebar */}
        <aside 
          className={cn(
            'fixed inset-y-0 z-40 transition-transform duration-300',
            sidebarPosition === 'left' ? 'left-0' : 'right-0',
            collapsible && collapsed && (
              sidebarPosition === 'left' ? '-translate-x-full' : 'translate-x-full'
            )
          )}
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </aside>

        {/* Main Content */}
        <main 
          className="transition-all duration-300"
          style={sidebarStyle}
        >
          {children}
        </main>

        {/* Mobile Overlay */}
        {collapsible && !collapsed && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setCollapsed(true)}
          />
        )}
      </div>
    )
  },
)

SidebarLayout.displayName = 'SidebarLayout'