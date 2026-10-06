import * as React from 'react'

import { cn } from '@/lib/utils'
import { GlobeIcon, Icon, SearchIcon } from '@/components/ui/icon'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { EmptyState, EmptyStateDescription, EmptyStateMedia } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Builder › Core Kit › citation drawer (10663:2792), built on Sheet: every source behind
// an answer. Figma layout side (400px, right edge) · bottom (rounded-2xl top, mobile) =
// `layout`. Header: title text/base/semibold ("Sources (6)") and the Sheet close. Optional filter
// (Figma show search) under the header. Figma state loading · loaded · empty = what the body holds:
// `status` loading (skeleton rows: 20px circle + two lines), ready (your `CitationDrawerList` of
// CitationSourceItems) or empty (Empty State: globe + `emptyMessage`, text/sm --muted-foreground). Figma's shadow/2xl
// → elevation/modal (Sheet's).

const CitationDrawer = Sheet
const CitationDrawerTrigger = SheetTrigger

function CitationDrawerContent({
  layout = 'side',
  status = 'ready',
  emptyMessage = 'No sources for this answer.',
  title,
  description,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SheetContent>, 'side' | 'title'> & {
  layout?: 'side' | 'bottom'
  /** Figma state loaded · loading · empty: ready shows the children (search + list). */
  status?: 'ready' | 'loading' | 'empty'
  /** Empty: what to say. */
  emptyMessage?: React.ReactNode
  title: React.ReactNode
  /** Screen-reader description of the drawer; visually hidden. */
  description?: React.ReactNode
}) {
  return (
    <SheetContent
      data-slot="citation-drawer"
      data-layout={layout}
      side={layout === 'bottom' ? 'bottom' : 'right'}
      className={cn(
        'flex flex-col gap-0 overflow-hidden p-0',
        layout === 'bottom' && 'mx-auto h-140 max-w-100 rounded-t-2xl',
        className,
      )}
      {...props}
    >
      <SheetHeader className="border-b px-4 py-3">
        <SheetTitle className="type-text-base-semibold">{title}</SheetTitle>
        <SheetDescription className="sr-only">{description ?? 'Sources for this answer'}</SheetDescription>
      </SheetHeader>
      {status === 'loading' ? (
        <CitationDrawerLoading />
      ) : status === 'empty' ? (
        <CitationDrawerEmpty>{emptyMessage}</CitationDrawerEmpty>
      ) : (
        children
      )}
    </SheetContent>
  )
}

/** Figma show search: filters the sources. */
function CitationDrawerSearch({
  className,
  placeholder = 'Filter sources',
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  return (
    <div data-slot="citation-drawer-search" className={cn('px-4 py-2', className)}>
      <InputGroup>
        <InputGroupAddon>
          <Icon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput aria-label={placeholder} placeholder={placeholder} {...props} />
      </InputGroup>
    </div>
  )
}

/** The sources: a scrolling list of CitationSourceItems (wrap each in an `li`). */
function CitationDrawerList({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="citation-drawer-list"
      aria-label="Sources"
      className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto', className)}
      {...props}
    />
  )
}

/** Figma state loading: skeleton rows while sources load. */
function CitationDrawerLoading() {
  return (
    <div
      data-slot="citation-drawer-loading"
      role="status"
      aria-label="Loading sources"
      className="flex flex-1 flex-col gap-4 p-4"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton shape="circle" className="size-5" />
          <div className="flex w-40 flex-col gap-2">
            <Skeleton className="h-3.5" />
            <Skeleton className="h-2.5" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Figma state empty: Empty State with a globe. */
function CitationDrawerEmpty({ children }: { children: React.ReactNode }) {
  return (
    <EmptyState data-slot="citation-drawer-empty" className="flex-1 gap-2 border-0 p-4 md:p-4">
      <EmptyStateMedia className="mb-0">
        <Icon icon={GlobeIcon} className="size-6 text-foreground" />
      </EmptyStateMedia>
      <EmptyStateDescription className="type-text-sm-normal text-muted-foreground">
        {children}
      </EmptyStateDescription>
    </EmptyState>
  )
}

export {
  CitationDrawer,
  CitationDrawerTrigger,
  CitationDrawerContent,
  CitationDrawerSearch,
  CitationDrawerList,
}
