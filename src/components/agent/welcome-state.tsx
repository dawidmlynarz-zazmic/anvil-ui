import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import { SparklesIcon, type LucideIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › Shell · welcome state (10727:2097): the new-chat screen. Built on
// Empty State (no border here): a column up to 768px, --space-3xl above and below, --space-lg
// apart. Header: a 40px agent Icon Tile (sparkles), the `greeting` heading/3xl and `subtitle`
// text/base muted, 8px apart. Then the `composer` (a Prompt Input) and the starters (`children`,
// Starter Prompt Cards) in a grid filling the column: two columns from 736px (two 360px cards), one
// below, 16px apart. Empty State's media sizes icons to 48px; the tile's 18px is restored.

function WelcomeState({
  greeting,
  subtitle = 'How can I help today?',
  icon = SparklesIcon,
  composer,
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  /** The heading, e.g. "Good afternoon, Maya". */
  greeting: React.ReactNode
  subtitle?: React.ReactNode
  /** The glyph in the agent tile. */
  icon?: LucideIcon
  /** The composer, usually a Prompt Input. */
  composer?: React.ReactNode
  /** Starter Prompt Cards. */
  children?: React.ReactNode
}) {
  return (
    <EmptyState
      data-slot="welcome-state"
      className={cn(
        'mx-auto w-full max-w-192 flex-none gap-(--space-lg) p-0 py-(--space-3xl) md:p-0 md:py-(--space-3xl)',
        className,
      )}
      {...props}
    >
      <EmptyStateHeader className="max-w-none">
        <EmptyStateMedia className="mb-0 [&_svg:not([class*='size-'])]:size-4.5">
          <IconTile icon={icon} tone="agent" />
        </EmptyStateMedia>
        <EmptyStateTitle role="heading" aria-level={2} className="type-heading-3xl">
          {greeting}
        </EmptyStateTitle>
        {subtitle && (
          <EmptyStateDescription className="type-text-base-normal text-muted-foreground">
            {subtitle}
          </EmptyStateDescription>
        )}
      </EmptyStateHeader>
      {(composer || children) && (
        <EmptyStateContent className="@container max-w-none items-stretch gap-(--space-lg) text-left">
          {composer}
          {children && (
            <div
              data-slot="welcome-state-starters"
              className="grid gap-4 *:max-w-none @min-[46rem]:grid-cols-2"
            >
              {children}
            </div>
          )}
        </EmptyStateContent>
      )}
    </EmptyState>
  )
}

export { WelcomeState }
