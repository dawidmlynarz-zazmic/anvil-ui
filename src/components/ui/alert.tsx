import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Figma: Alert page → `alert` (10671:2494). Callout for user attention. Optional icon (16px, Icon) +
// title (text/sm/medium, one line) + description (text/sm/normal). Radius lg, padding 16 / 12, gap 12
// (icon) and 2 (title → description). `tone` (API Contract; Figma `tone`):
// - neutral (default): --card with a --border stroke, --card-foreground title, muted description.
// - info · success · warning · destructive · agent: tinted — --{tone}-subtle surface, --{tone}-muted
//   stroke, --{tone}-strong title, --{tone}-medium icon and description (destructive → --danger-*).
// shadcn's `variant="destructive"` still works and maps to tone="destructive".
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
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 type-text-sm-normal has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
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
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
)

type AlertProps = React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & {
    /** shadcn/ui API, kept for compatibility: `destructive` = `tone="destructive"`. Prefer `tone`. */
    variant?: 'default' | 'destructive'
  }

function Alert({ className, tone, variant, ...props }: AlertProps) {
  const resolved = tone ?? (variant === 'destructive' ? 'destructive' : 'neutral')
  return (
    <div
      data-slot="alert"
      data-tone={resolved}
      role="alert"
      className={cn(alertVariants({ tone: resolved }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 type-text-sm-medium', className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 type-text-sm-normal text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
