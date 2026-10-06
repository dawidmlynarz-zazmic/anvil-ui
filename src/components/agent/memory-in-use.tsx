import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { BrainIcon, Icon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › memory in use (10737:3110): marks an answer that used memory.
// inline: --agent-subtle pill, 8/10px × 4px, 6px gap, 14px icon, text/xs/medium --agent-strong.
// details: the chip opens a Popover (12px padding, 10px gap; Figma shadow/lg → elevation/raised)
// with the title, description and `actions` (outline xs · ghost xs · ghost destructive xs).
// not used: a neutral pill Badge (semantic, sm, 12px icon; Figma status badge) with `undo` beside it.
// Figma `state` inline / details / not used → `used` + the popover's `open`.

function MemoryInUse({
  used = true,
  title,
  description,
  actions,
  undo,
  open,
  defaultOpen,
  onOpenChange,
  onOpenAutoFocus,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  /** false = the memory was left out of this answer (Figma not used). */
  used?: boolean
  /** Popover title, e.g. "I used this from memory". */
  title?: React.ReactNode
  /** The saved memory and when it was saved. */
  description?: React.ReactNode
  /** Popover actions (xs Buttons). */
  actions?: React.ReactNode
  /** Shown beside the chip when not used (ghost xs Button, e.g. Undo). */
  undo?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onOpenAutoFocus?: React.ComponentProps<typeof PopoverContent>['onOpenAutoFocus']
}) {
  if (!used) {
    return (
      <div
        data-slot="memory-in-use"
        data-used="false"
        className={cn('flex flex-col items-start gap-2', className)}
        {...props}
      >
        <Badge variant="semantic" tone="neutral" shape="pill" size="sm">
          <Icon icon={BrainIcon} />
          {children}
        </Badge>
        {undo}
      </div>
    )
  }
  const chip =
    'inline-flex items-center gap-1.5 rounded-full bg-agent-subtle py-1 pr-2.5 pl-2 type-text-xs-medium text-agent-strong dark:text-foreground [&>svg]:size-3.5 [&>svg]:text-agent dark:[&>svg]:text-agent-medium'
  return (
    <div
      data-slot="memory-in-use"
      data-used="true"
      className={cn('flex flex-col items-start gap-2', className)}
      {...props}
    >
      {title || description || actions ? (
        <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
          <PopoverTrigger className={cn(chip, 'focus-visible:focus-ring outline-none hover:bg-agent-soft')}>
            <Icon icon={BrainIcon} />
            {children}
          </PopoverTrigger>
          <PopoverContent
            align="start"
            onOpenAutoFocus={onOpenAutoFocus}
            className="w-90 max-w-160 gap-2.5 p-3"
          >
            {title && <PopoverTitle className="type-text-sm-semibold">{title}</PopoverTitle>}
            {description && (
              <PopoverDescription className="type-text-xs-normal">{description}</PopoverDescription>
            )}
            {actions && <div className="flex flex-wrap gap-1">{actions}</div>}
          </PopoverContent>
        </Popover>
      ) : (
        <span className={chip}>
          <Icon icon={BrainIcon} />
          {children}
        </span>
      )}
    </div>
  )
}

export { MemoryInUse }
