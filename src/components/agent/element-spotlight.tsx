import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CheckIcon, EyeIcon, Icon, LoaderCircleIcon, TriangleAlertIcon } from '@/components/ui/icon'

// Figma Agent Builder › Surfaces › Ambient overlay · element spotlight (10752:6557): a highlight the
// agent draws around an element on the host page. Built on Badge (the tag), nothing re-drawn.
// Figma state → `status`: referenced (--agent) · filling (--agent, a spinning glyph: decorative, the label says “Filling…”) · filled (--success) ·
// review (Figma "needs review", --warning). A 2px border in the status colour at radius lg, sized to
// the element it wraps (`children`, or the host sizes it), and a solid pill Badge 6px above it,
// right-aligned (`end-0 -top-7`): glyph + `label`. The label always says the state, so colour is
// never the only signal, and it is a polite status (the host page is not interrupted). The page scrim
// is the overlay (--overlay), not part of this; an anchored tooltip is a Popover.

type SpotlightStatus = 'referenced' | 'filling' | 'filled' | 'review'

const BORDER = {
  referenced: 'border-agent',
  filling: 'border-agent',
  filled: 'border-success',
  review: 'border-warning',
} as const

const TONE = { referenced: 'agent', filling: 'agent', filled: 'success', review: 'warning' } as const

const DEFAULT_LABEL = {
  referenced: 'Looking here',
  filling: 'Filling…',
  filled: 'Filled',
  review: 'Check this',
} as const

function ElementSpotlight({
  status = 'referenced',
  label,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** Figma state referenced · filling · filled · needs review. */
  status?: SpotlightStatus
  /** The tag's text, e.g. “Filled from your profile”; each status has a default. */
  label?: React.ReactNode
}) {
  return (
    <div
      data-slot="element-spotlight"
      data-status={status}
      className={cn('relative rounded-lg border-2', BORDER[status], className)}
      {...props}
    >
      <Badge
        tone={TONE[status]}
        shape="pill"
        size="sm"
        role="status"
        className="absolute -top-7 end-0 py-[3px]"
      >
        {status === 'filling' ? (
          <Icon icon={LoaderCircleIcon} className="animate-spin" />
        ) : (
          <Icon icon={status === 'filled' ? CheckIcon : status === 'review' ? TriangleAlertIcon : EyeIcon} />
        )}
        {label ?? DEFAULT_LABEL[status]}
      </Badge>
      {children}
    </div>
  )
}

export { ElementSpotlight, type SpotlightStatus }
