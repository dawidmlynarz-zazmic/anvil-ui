import * as React from 'react'

import { cn } from '@/lib/utils'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  BotIcon,
  ChevronDownIcon,
  FolderIcon,
  Icon,
  InfoIcon,
  XIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { IconTile } from '@/components/anvil/icon-tile'

// Figma Agent Builder › Core Kit › instructions banner (10737:3041): thread-level context at the top
// of a chat. --card, --border, radius lg, 12/10px, 12px gap: 32px radius-lg icon tile by `tone`
// (Figma type project = info · persona = agent · notice = neutral; the icon follows), title text/sm/medium, detail
// text/xs --muted-foreground, `action` (ghost xs), then expand (when it has `children`, on
// Collapsible) or dismiss (`onDismiss`).

type Tone = 'info' | 'agent' | 'neutral'

const ICON = { info: FolderIcon, agent: BotIcon, neutral: InfoIcon } as const

function InstructionsBanner({
  tone = 'neutral',
  icon = ICON[tone],
  title,
  detail,
  action,
  onDismiss,
  defaultOpen,
  open,
  onOpenChange,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  tone?: Tone
  /** Defaults to the Figma type icon: folder (project), bot (persona), info (notice). */
  icon?: LucideIcon
  title: React.ReactNode
  detail?: React.ReactNode
  /** e.g. Edit, Change, Turn on (ghost xs Button). */
  action?: React.ReactNode
  onDismiss?: () => void
  /** The full instructions, shown when expanded. */
  children?: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Collapsible
      data-slot="instructions-banner"
      data-tone={tone}
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        'group/instructions flex w-full max-w-(--shell-thread-max) flex-col rounded-lg border bg-card text-card-foreground',
        className,
      )}
      {...props}
    >
      <Item size="sm" className="flex-nowrap rounded-none border-0">
        <ItemMedia>
          <IconTile icon={icon} tone={tone} size="sm" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="block truncate">{title}</ItemTitle>
          {detail && <ItemDescription className="line-clamp-1 block truncate">{detail}</ItemDescription>}
        </ItemContent>
        <ItemActions className="gap-1">
          {action}
          {children ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" intent="neutral" size="icon-xs" aria-label="Show instructions">
                <Icon
                  icon={ChevronDownIcon}
                  className="transition-transform group-data-[state=open]/instructions:rotate-180"
                />
              </Button>
            </CollapsibleTrigger>
          ) : (
            onDismiss && (
              <Button
                variant="ghost"
                intent="neutral"
                size="icon-xs"
                aria-label="Dismiss"
                onClick={onDismiss}
              >
                <Icon icon={XIcon} />
              </Button>
            )
          )}
        </ItemActions>
      </Item>
      {children && (
        <CollapsibleContent className="border-t px-3 py-2.5 type-text-sm-normal text-muted-foreground">
          {children}
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

export { InstructionsBanner }
