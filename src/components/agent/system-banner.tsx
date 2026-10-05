import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icon, XIcon, type LucideIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › system banner (10728:2505): an inline notice in the thread. Radius
// lg, 1px stroke, 16/10px padding, 12px gap: 16px icon, message text/sm, optional action (outline ·
// neutral · xs), dismiss (ghost icon-xs). Figma type → `tone` + `icon`: usage limit (gauge) and
// rate limit (clock) = warning · offline (wifi-off) = neutral · long chat (info) = info ·
// incomplete (triangle-alert) = destructive. Tinted tones: --{tone}-subtle surface, --{tone}-soft
// stroke, --{tone}-strong text, --{tone} icon; neutral: --muted, --border, --muted-foreground.
// role="status" (polite); use role="alert" via props for urgent ones.

const systemBannerVariants = cva(
  'flex w-full max-w-(--shell-thread-max) items-center gap-3 rounded-lg border px-4 py-2.5 type-text-sm-normal wrap-break-word',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-muted text-muted-foreground [&>svg]:text-muted-foreground',
        info: 'border-info-soft bg-info-subtle text-info-strong [&>svg]:text-info',
        warning: 'border-warning-soft bg-warning-subtle text-warning-strong [&>svg]:text-warning',
        destructive: 'border-danger-soft bg-danger-subtle text-danger-strong [&>svg]:text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

function SystemBanner({
  tone,
  icon,
  action,
  onDismiss,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof systemBannerVariants> & {
    icon?: LucideIcon
    /** e.g. an outline xs Button: Upgrade, Retry, New chat. */
    action?: React.ReactNode
    onDismiss?: () => void
  }) {
  return (
    <div
      role="status"
      data-slot="system-banner"
      data-tone={tone ?? 'neutral'}
      className={cn(systemBannerVariants({ tone }), className)}
      {...props}
    >
      {icon && <Icon icon={icon} />}
      <p className="min-w-0 flex-1">{children}</p>
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
  )
}

export { SystemBanner, systemBannerVariants }
