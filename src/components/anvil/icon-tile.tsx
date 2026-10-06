import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Icon, type LucideIcon } from '@/components/ui/icon'

// Figma icon tile (10843:4460): an icon on a tinted square or circle, leading a card header, row
// or banner. `tone` neutral (--muted) · brand · agent · info · success · warning · destructive
// (--{tone}-subtle; icon in the tone, -medium in dark) · surface (--card + border) · inverse
// (--overlay-inverse-16, for dark surfaces). `size` xs · sm · default · lg = 24 / 32 / 40 / 48 with
// a 14 / 16 / 18 / 22px icon; `shape` default (radius md at xs, lg above) · circle. Decorative:
// the text beside it names the thing.

const iconTileVariants = cva('inline-flex shrink-0 items-center justify-center [&>svg]:shrink-0', {
  variants: {
    tone: {
      neutral: 'bg-muted text-foreground',
      brand: 'bg-info-subtle text-primary dark:text-info-medium',
      agent: 'bg-agent-subtle text-agent dark:text-agent-medium',
      info: 'bg-info-subtle text-info dark:text-info-medium',
      success: 'bg-success-subtle text-success dark:text-success-medium',
      warning: 'bg-warning-subtle text-warning dark:text-warning-medium',
      destructive: 'bg-danger-subtle text-danger dark:text-danger-medium',
      surface: 'border bg-card text-foreground',
      inverse: 'bg-overlay-inverse-16 text-foreground-inverse',
    },
    size: {
      xs: 'size-6 rounded-md [&>svg]:size-3.5',
      sm: 'size-8 rounded-lg [&>svg]:size-4',
      default: 'size-10 rounded-lg [&>svg]:size-4.5',
      lg: 'size-12 rounded-lg [&>svg]:size-5.5',
    },
    shape: { default: '', circle: 'rounded-full' },
  },
  defaultVariants: { tone: 'neutral', size: 'default', shape: 'default' },
})

function IconTile({
  icon,
  tone,
  size,
  shape,
  className,
  children,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof iconTileVariants> & {
    /** The glyph; or pass an image / logo as children. */
    icon?: LucideIcon
  }) {
  return (
    <span
      aria-hidden
      data-slot="icon-tile"
      data-tone={tone ?? 'neutral'}
      className={cn(iconTileVariants({ tone, size, shape }), className)}
      {...props}
    >
      {icon ? <Icon icon={icon} /> : children}
    </span>
  )
}

export { IconTile, iconTileVariants }
