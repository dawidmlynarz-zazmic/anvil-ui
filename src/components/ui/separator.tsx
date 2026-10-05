import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Separator as SeparatorPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Separator page → `separator` (8225:681). A 1px --overlay-8 line, horizontal or vertical
// (Figma `vertical`), `variant` solid · dashed (Figma `style`). Figma `content` text: pass children
// for a label (text/2xs/medium, --foreground-subtle, gap 8) placed by `align` start · center · end
// (Figma `content position`); the lines around it are decorative.

const lineVariants = cva('shrink-0', {
  variants: {
    variant: {
      solid: 'bg-overlay-8',
      dashed: 'border-overlay-8 bg-transparent',
    },
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
  },
  compoundVariants: [
    { variant: 'dashed', orientation: 'horizontal', className: 'h-0 border-t border-dashed' },
    { variant: 'dashed', orientation: 'vertical', className: 'w-0 border-l border-dashed' },
  ],
  defaultVariants: { variant: 'solid', orientation: 'horizontal' },
})

type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root> &
  Pick<VariantProps<typeof lineVariants>, 'variant'> & {
    /** Where the label sits (horizontal only). */
    align?: 'start' | 'center' | 'end'
  }

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  variant = 'solid',
  align = 'center',
  children,
  ...props
}: SeparatorProps) {
  if (children && orientation === 'horizontal') {
    // A labelled divider: the label is content (read out), the lines are decoration.
    const line = (
      <span
        aria-hidden
        data-slot="separator-line"
        className={cn(lineVariants({ variant, orientation }), 'flex-1')}
      />
    )
    return (
      <div
        data-slot="separator"
        data-orientation={orientation}
        data-align={align}
        className={cn(
          'flex w-full items-center gap-2 type-text-2xs-medium text-foreground-subtle',
          className,
        )}
        {...(props as React.ComponentProps<'div'>)}
      >
        {align !== 'start' && line}
        <span className="shrink-0">{children}</span>
        {align !== 'end' && line}
      </div>
    )
  }
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      data-variant={variant}
      decorative={decorative}
      orientation={orientation}
      className={cn(lineVariants({ variant, orientation }), className)}
      {...props}
    />
  )
}

export { Separator, type SeparatorProps }
