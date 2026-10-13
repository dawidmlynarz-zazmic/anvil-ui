import * as React from 'react'

import { cn } from '@/lib/utils'
import { AnnouncementBar, type AnnouncementTone } from '@/components/agent/announcement-bar'
import { IconTile } from '@/components/anvil/icon-tile'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Icon,
  SparklesIcon,
  TagIcon,
  type LucideIcon,
} from '@/components/ui/icon'

// Figma Agent Builder › Surfaces › Proactive · proactive drawer (10752:6492): an expandable
// preview of something the agent noticed ("Built on shadcn/ui: Drawer"). Composed, nothing re-drawn.
// Figma state → `expanded`:
// - peek: the Announcement Bar (position bottom) with a "Show me" outline pill Button that
//   expands it, and dismiss.
// - expanded: a Drawer (bottom, non-modal so the page stays usable) — handle, a Drawer Header
//   (32px agent circle Icon Tile, `title` text/base/semibold, `meta` text/xs, a collapse button),
//   the body (`children`: the message and a preview of what it is about, e.g. an Item), and a card
//   Drawer Footer: "Don't suggest this" (ghost, `onMute`), Dismiss (outline, `onDismiss`) and the
//   primary action (brand, `primaryLabel` / `onPrimary`).
// Where the drawer sits on the page (bottom, centred, 720px) is the host's job; this fills it.

function ProactiveDrawer({
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  tone = 'success',
  icon = TagIcon,
  message,
  expandLabel = 'Show me',
  title,
  meta,
  children,
  muteLabel = 'Don’t suggest this',
  onMute,
  dismissLabel = 'Dismiss',
  onDismiss,
  primaryLabel,
  primaryIcon = CheckIcon,
  onPrimary,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** The peek bar's tone (agent · warning · success). */
  tone?: AnnouncementTone
  /** The peek bar's glyph. */
  icon?: LucideIcon
  /** Peek: the one-line message. */
  message: React.ReactNode
  expandLabel?: React.ReactNode
  /** Expanded: the heading. */
  title: React.ReactNode
  /** Expanded: who, when and what about, e.g. "Assistant · just now · Q3 launch plan". */
  meta?: React.ReactNode
  /** Expanded: the body: the message and a preview of what it is about. */
  children?: React.ReactNode
  muteLabel?: React.ReactNode
  /** Shows the mute action. */
  onMute?: () => void
  dismissLabel?: React.ReactNode
  /** Dismiss (both states). */
  onDismiss?: () => void
  /** The primary action's label, e.g. "Review & hold seats". */
  primaryLabel?: React.ReactNode
  primaryIcon?: LucideIcon
  onPrimary?: () => void
}) {
  const [inner, setInner] = React.useState(defaultExpanded)
  const isExpanded = expanded ?? inner
  const setExpanded = (next: boolean) => {
    setInner(next)
    onExpandedChange?.(next)
  }

  return (
    <div
      data-slot="proactive-drawer"
      data-state={isExpanded ? 'expanded' : 'peek'}
      className={cn('w-full', className)}
      {...props}
    >
      {!isExpanded && (
        <AnnouncementBar
          position="bottom"
          tone={tone}
          icon={icon}
          onDismiss={onDismiss}
          action={
            <Button
              variant="outline"
              intent="neutral"
              size="sm"
              shape="pill"
              onClick={() => setExpanded(true)}
            >
              <Icon icon={ChevronUpIcon} />
              {expandLabel}
            </Button>
          }
        >
          {message}
        </AnnouncementBar>
      )}
      <Drawer open={isExpanded} onOpenChange={setExpanded} modal={false}>
        <DrawerContent
          showCloseButton={false}
          className="mx-auto max-w-180 data-[vaul-drawer-direction=bottom]:bottom-6 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:rounded-2xl"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DrawerHeader
            media={<IconTile icon={SparklesIcon} tone="agent" size="sm" shape="circle" />}
            trailing={
              <Button
                variant="ghost"
                intent="neutral"
                size="icon-sm"
                shape="circle"
                aria-label="Collapse"
                onClick={() => setExpanded(false)}
              >
                <Icon icon={ChevronDownIcon} />
              </Button>
            }
            className="border-b-0 px-5 pb-3"
          >
            <DrawerTitle className="type-text-base-semibold">{title}</DrawerTitle>
            {meta && <DrawerDescription>{meta}</DrawerDescription>}
          </DrawerHeader>
          <DrawerBody className="gap-3 px-5 pt-0 pb-4 type-text-sm-normal">{children}</DrawerBody>
          <DrawerFooter variant="card" className="px-5 py-3">
            {onMute && (
              <Button variant="ghost" intent="neutral" size="sm" onClick={onMute}>
                {muteLabel}
              </Button>
            )}
            <span className="flex-1" />
            <Button variant="outline" intent="neutral" size="sm" onClick={onDismiss}>
              {dismissLabel}
            </Button>
            {primaryLabel && (
              <Button intent="brand" size="sm" onClick={onPrimary}>
                <Icon icon={primaryIcon} />
                {primaryLabel}
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export { ProactiveDrawer }
