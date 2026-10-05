import * as React from 'react'

import { cn } from '@/lib/utils'
import { PulseDot } from '@/components/agent/pulse-dot'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { BotIcon, CheckIcon, CircleAlertIcon, ClockIcon, Icon } from '@/components/ui/icon'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from '@/components/ui/message'

// Figma Agent Builder › Core Kit › message row (10663:3597): the unit of a conversation thread, built
// on Message + Bubble. `role` user · assistant · system · tool × `status` queued · streaming ·
// complete · failed (Figma state; invalid = failed).
// - user: right-aligned, author "You" + time (+ clock while queued), muted bubble; failed → danger
//   border and "Failed to send · Retry".
// - assistant: agent avatar, author + time, then the slots in Figma order — thinking, the answer
//   (ghost bubble; a blinking --agent caret while streaming), citations, widget, error, actions.
// - system: a centered Marker line (alert icon when failed).
// - tool: avatar, author + time, a --muted card (--border-alpha-16, radius lg) with the tool call in
//   text/xs/medium and its status: Queued · Running… (pulse) · done (check, --success-strong) ·
//   failed (alert, --danger).
// Figma dims queued content to 60%; code uses --muted-foreground text instead (opacity breaks
// contrast). Figma's show … booleans = pass the slot or not.

type Role = 'user' | 'assistant' | 'system' | 'tool'
type Status = 'queued' | 'streaming' | 'complete' | 'failed'

type MessageRowProps = Omit<React.ComponentProps<'div'>, 'role'> & {
  role?: Role
  status?: Status
  author?: React.ReactNode
  timestamp?: React.ReactNode
  /** Replaces the agent avatar (assistant, tool). */
  avatar?: React.ReactNode
  /** Thinking Panel (assistant). */
  thinking?: React.ReactNode
  /** Citation Chips (assistant). */
  citations?: React.ReactNode
  /** Any widget (assistant), e.g. a File Output Card. */
  widget?: React.ReactNode
  /** Message Actions (assistant). */
  actions?: React.ReactNode
  /** Shown when failed (assistant), e.g. an Alert. */
  error?: React.ReactNode
  /** Tool status text (tool), e.g. "Completed in 1.2s". */
  detail?: React.ReactNode
  /** User failed: the Retry action. */
  onRetry?: () => void
}

function AgentAvatar() {
  return (
    <Avatar size="xs">
      <AvatarFallback tone="agent">
        <Icon icon={BotIcon} />
      </AvatarFallback>
    </Avatar>
  )
}

function Meta({
  author,
  timestamp,
  queued,
}: {
  author?: React.ReactNode
  timestamp?: React.ReactNode
  queued: boolean
}) {
  if (!author && !timestamp && !queued) return null
  return (
    <MessageHeader>
      {author && <strong>{author}</strong>}
      {timestamp && <span>{timestamp}</span>}
      {queued && <Icon icon={ClockIcon} size="xs" label="Queued" />}
    </MessageHeader>
  )
}

function MessageRow({
  role = 'assistant',
  status = 'complete',
  author,
  timestamp,
  avatar,
  thinking,
  citations,
  widget,
  actions,
  error,
  detail,
  onRetry,
  className,
  children,
  ...props
}: MessageRowProps) {
  const queued = status === 'queued'
  const failed = status === 'failed'
  const shared = { 'data-slot': 'message-row', 'data-role': role, 'data-status': status, ...props }

  if (role === 'system') {
    return (
      <Marker {...shared} className={cn('justify-center py-2', className)}>
        {failed && (
          <MarkerIcon>
            <Icon icon={CircleAlertIcon} />
          </MarkerIcon>
        )}
        <MarkerContent>{children}</MarkerContent>
      </Marker>
    )
  }

  if (role === 'user') {
    return (
      <Message {...shared} align="end" className={cn('max-w-(--shell-thread-max)', className)}>
        <MessageContent>
          <Meta author={author ?? 'You'} timestamp={timestamp} queued={queued} />
          <Bubble variant="muted">
            <BubbleContent
              aria-invalid={failed || undefined}
              className={cn(queued && 'text-muted-foreground')}
            >
              {children}
            </BubbleContent>
          </Bubble>
          {failed && (
            <MessageFooter className="gap-1 text-danger-medium">
              <Icon icon={CircleAlertIcon} size="xs" />
              Failed to send ·
              <button
                type="button"
                onClick={onRetry}
                className="rounded-sm type-text-xs-medium underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
              >
                Retry
              </button>
            </MessageFooter>
          )}
        </MessageContent>
      </Message>
    )
  }

  if (role === 'tool') {
    const toolStatus = {
      queued: { icon: <Icon icon={ClockIcon} size="xs" />, tone: 'text-muted-foreground' },
      streaming: { icon: <PulseDot />, tone: 'text-foreground-link dark:text-info-medium' },
      complete: { icon: <Icon icon={CheckIcon} size="xs" />, tone: 'text-success-strong' },
      failed: { icon: <Icon icon={CircleAlertIcon} size="xs" />, tone: 'text-danger-medium' },
    }[status]
    return (
      <Message {...shared} className={cn('max-w-(--shell-thread-max)', className)}>
        <MessageAvatar>{avatar ?? <AgentAvatar />}</MessageAvatar>
        <MessageContent>
          <Meta author={author} timestamp={timestamp} queued={queued} />
          <div className="flex w-full max-w-140 items-center gap-2 rounded-lg bg-muted px-3 py-2 inset-ring inset-ring-border-alpha-16">
            <span className="min-w-0 flex-1 truncate type-text-xs-medium text-muted-foreground">
              {children}
            </span>
            <span className={cn('flex shrink-0 items-center gap-1 type-text-xs-normal', toolStatus.tone)}>
              {toolStatus.icon}
              {detail ?? (status === 'streaming' ? 'Running…' : status === 'queued' ? 'Queued' : null)}
            </span>
          </div>
        </MessageContent>
      </Message>
    )
  }

  return (
    <Message {...shared} className={cn('max-w-(--shell-thread-max)', className)}>
      <MessageAvatar>{avatar ?? <AgentAvatar />}</MessageAvatar>
      <MessageContent>
        <Meta author={author} timestamp={timestamp} queued={queued} />
        {thinking}
        {children && (
          <Bubble variant="ghost">
            <BubbleContent className={cn(queued && 'text-muted-foreground')}>
              {children}
              {status === 'streaming' && (
                <span
                  aria-hidden
                  className="ms-1 inline-block h-4 w-2 animate-caret rounded-2xs bg-agent align-text-bottom"
                />
              )}
            </BubbleContent>
          </Bubble>
        )}
        {citations && <div className="flex flex-wrap items-center gap-1">{citations}</div>}
        {widget}
        {failed && error}
        {actions && <MessageFooter>{actions}</MessageFooter>}
      </MessageContent>
    </Message>
  )
}

export { MessageRow, type MessageRowProps }
