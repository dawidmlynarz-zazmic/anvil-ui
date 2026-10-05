import * as React from 'react'
import { cn } from '@/lib/utils'

// Figma Agent Builder › message row (10663:3597): avatar (24px, top-aligned) 12px from a column of
// meta (author text/xs/semibold, time text/xs/normal --muted-foreground, 8px apart), content and
// actions, 8px apart. The user's row is `align="end"` and drops the avatar; the meta and the
// bubble sit on the bubble's edge (no inset).

function MessageGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="message-group" className={cn('flex min-w-0 flex-col gap-2', className)} {...props} />
}

function Message({
  className,
  align = 'start',
  ...props
}: React.ComponentProps<'div'> & { align?: 'start' | 'end' }) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(
        'group/message relative flex w-full min-w-0 gap-3 type-text-sm-normal text-foreground data-[align=end]:flex-row-reverse',
        className,
      )}
      {...props}
    />
  )
}

function MessageAvatar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        'flex w-fit shrink-0 items-center justify-center self-start overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  )
}

function MessageContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        'flex w-full min-w-0 flex-col gap-2 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end',
        className,
      )}
      {...props}
    />
  )
}

function MessageHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-header"
      className={cn(
        'flex max-w-full min-w-0 items-center gap-2 type-text-xs-normal text-muted-foreground [&_strong]:type-text-xs-semibold [&_strong]:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function MessageFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="message-footer"
      className={cn(
        'flex max-w-full min-w-0 items-center gap-1 type-text-xs-normal text-muted-foreground group-data-[align=end]/message:justify-end',
        className,
      )}
      {...props}
    />
  )
}

export { MessageGroup, Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader }
