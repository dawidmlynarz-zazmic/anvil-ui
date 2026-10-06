import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icon, XIcon } from '@/components/ui/icon'

// Figma: Alert page → `alert` (10671:2494). Callout for user attention. Optional icon (16px, Icon) +
// title (text/sm/medium, one line) + description (text/sm/normal). Radius lg, padding 16 / 12, gap 12
// (icon) and 2 (title → description). `tone` (API Contract; Figma `tone`):
// - neutral (default): --card with a --border stroke, --card-foreground title, muted description.
// - info · success · warning · destructive · agent: tinted — --{tone}-subtle surface, --{tone}-muted
//   stroke, --{tone}-strong title, --{tone}-medium icon and description (destructive → --danger-*).
// shadcn's `variant="destructive"` still works and maps to tone="destructive".
// `size` (audit M2): default (title + description) · sm (Figma system banner: a one-line notice in
// the thread, 16/10px, centered) · xs (Figma part / inline note: a note inside a card, radius md,
// 12/10px, text/xs, 14px icon). `action` (e.g. an outline xs Button) and `onDismiss` (a ghost
// icon-xs X) sit in a trailing column. role="alert" by default; pass role="status" for polite
// notices (system banners).
const tinted = (tone: 'info' | 'success' | 'warning' | 'danger' | 'agent') =>
  ({
    info: 'border-info-muted bg-info-subtle text-info-strong [&>svg]:text-info-medium *:data-[slot=alert-description]:text-info-medium',
    success:
      'border-success-muted bg-success-subtle text-success-strong [&>svg]:text-success-medium *:data-[slot=alert-description]:text-success-medium',
    warning:
      'border-warning-muted bg-warning-subtle text-warning-strong [&>svg]:text-warning-medium *:data-[slot=alert-description]:text-warning-medium',
    danger:
      'border-danger-muted bg-danger-subtle text-danger-strong [&>svg]:text-danger-medium *:data-[slot=alert-description]:text-danger-medium',
    agent:
      'border-agent-muted bg-agent-subtle text-agent-strong [&>svg]:text-agent-medium *:data-[slot=alert-description]:text-agent-medium',
  })[tone]

const alertVariants = cva(
  'group/alert relative grid w-full grid-cols-[0_1fr_auto] items-start gap-y-0.5 rounded-lg border px-4 py-3 type-text-sm-normal wrap-break-word has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr_auto] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-card text-card-foreground',
        info: tinted('info'),
        success: tinted('success'),
        warning: tinted('warning'),
        destructive: tinted('danger'),
        agent: tinted('agent'),
      },
      size: {
        default: '',
        sm: 'items-center py-2.5 [&>svg]:translate-y-0',
        xs: 'rounded-md px-3 py-2.5 type-text-xs-normal has-[>svg]:grid-cols-[calc(var(--spacing)*3.5)_1fr_auto] has-[>svg]:gap-x-2 [&>svg]:size-3.5',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'default',
    },
  },
)

type AlertProps = React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & {
    /** shadcn/ui API, kept for compatibility: `destructive` = `tone="destructive"`. Prefer `tone`. */
    variant?: 'default' | 'destructive'
    /** Trailing action, e.g. an outline xs Button (Upgrade, Retry, New chat). */
    action?: React.ReactNode
    /** Shows a dismiss button (ghost icon-xs X) at the end. */
    onDismiss?: () => void
  }

function Alert({
  className,
  tone,
  size = 'default',
  variant,
  action,
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const resolved = tone ?? (variant === 'destructive' ? 'destructive' : 'neutral')
  return (
    <div
      data-slot="alert"
      data-tone={resolved}
      data-size={size}
      role="alert"
      className={cn(alertVariants({ tone: resolved, size }), className)}
      {...props}
    >
      {children}
      {(action || onDismiss) && (
        <div
          data-slot="alert-actions"
          className="col-start-3 row-span-2 row-start-1 flex items-center gap-1 self-center ps-3"
        >
          {action}
          {onDismiss && (
            <Button
              variant="ghost"
              intent="neutral"
              size="icon-xs"
              aria-label="Dismiss"
              onClick={onDismiss}
              className="text-current"
            >
              <Icon icon={XIcon} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 type-text-sm-medium group-data-[size=xs]/alert:type-text-xs-medium',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 type-text-sm-normal text-muted-foreground group-data-[size=xs]/alert:type-text-xs-normal',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
