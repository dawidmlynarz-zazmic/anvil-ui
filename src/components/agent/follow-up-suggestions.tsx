import * as React from 'react'

import { cn } from '@/lib/utils'
import { ArrowRightIcon, CornerDownRightIcon, Icon, PlusIcon, SparklesIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › follow up suggestions (10668:15663): next questions the user can
// send in one tap. Optional label row (12px sparkles + text/xs/medium --muted-foreground), then the
// suggestions, 8px below. `layout` chips: wrapping --muted pills with an --input stroke (12/8px,
// text/xs/medium, 12px arrow), 8px apart · list: one --input-bordered radius-lg block of rows
// (12/8px, text/sm, 14px corner arrow, plus at the end, --border between rows). Each suggestion is a
// button; hover deepens the fill, focus shows the ring. Figma show suggestion 3 / 4 = how many you
// render.

type Layout = 'chips' | 'list'

const LayoutContext = React.createContext<Layout>('chips')

function FollowUpSuggestions({
  label = 'Suggested follow-ups',
  layout = 'chips',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** Figma show label: pass null to hide it. */
  label?: React.ReactNode
  layout?: Layout
}) {
  const id = React.useId()
  return (
    <LayoutContext.Provider value={layout}>
      <div
        data-slot="follow-up-suggestions"
        data-layout={layout}
        className={cn('flex w-full max-w-(--shell-widget-max) flex-col gap-2', className)}
        {...props}
      >
        {label && (
          <p id={id} className="flex items-center gap-2 type-text-xs-medium text-muted-foreground">
            <Icon icon={SparklesIcon} size="xs" />
            {label}
          </p>
        )}
        <ul
          aria-labelledby={label ? id : undefined}
          className={cn(
            layout === 'chips'
              ? 'flex flex-wrap gap-2'
              : 'flex flex-col overflow-hidden rounded-lg inset-ring inset-ring-input [&>li:not(:last-child)]:border-b',
          )}
        >
          {children}
        </ul>
      </div>
    </LayoutContext.Provider>
  )
}

function FollowUpSuggestion({ className, children, ...props }: React.ComponentProps<'button'>) {
  const layout = React.useContext(LayoutContext)
  return (
    <li className="flex">
      <button
        type="button"
        data-slot="follow-up-suggestion"
        className={cn(
          'flex items-center text-left text-foreground outline-none transition-colors duration-(--duration-fast) focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
          layout === 'chips'
            ? 'gap-1 rounded-full bg-muted px-3 py-2 type-text-xs-medium inset-ring inset-ring-input hover:bg-accent'
            : 'w-full gap-2 px-3 py-2 type-text-sm-normal hover:bg-muted focus-visible:ring-offset-0',
          className,
        )}
        {...props}
      >
        <Icon
          icon={layout === 'chips' ? ArrowRightIcon : CornerDownRightIcon}
          className={cn('shrink-0 text-muted-foreground', layout === 'chips' ? 'size-3' : 'size-3.5')}
        />
        <span className="min-w-0 flex-1">{children}</span>
        {layout === 'list' && <Icon icon={PlusIcon} className="size-3.5 shrink-0 text-muted-foreground" />}
      </button>
    </li>
  )
}

export { FollowUpSuggestions, FollowUpSuggestion }
