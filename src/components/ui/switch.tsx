import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Forms page → `switch` (8230:1847) on `.switch-base` (1536:15641). Bare control with an
// inline Label (or a horizontal Field for a description). `size` default (32×20, 16px handle) ·
// sm (24×16, 12px handle); `checked` → data-[state=checked]. Figma `state` → selectors:
// hover → hover: (on: --button-primary-hover track; off: --muted handle), focus → focus-visible:
// (focus/ring), disabled → disabled:opacity-50 (API Contract; Figma also dims the track to 30%).
const switchVariants = cva(
  [
    'peer group/switch inline-flex shrink-0 items-center rounded-full p-0.5 outline-none',
    'bg-background-medium inset-shadow-xs data-[state=checked]:bg-primary',
    'transition-[background-color,box-shadow] duration-(--duration-fast) ease-out',
    'data-[state=checked]:hover:bg-button-primary-hover focus-visible:focus-ring',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:data-[state=checked]:hover:bg-primary',
  ],
  {
    variants: {
      size: {
        default: 'h-5 w-8',
        sm: 'h-4 w-6',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>

function Switch({ className, size = 'default', ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(switchVariants({ size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full bg-primary-foreground shadow-sm',
          'transition-[translate,background-color] duration-(--duration-fast) ease-out motion-reduce:transition-[background-color]',
          'group-hover/switch:data-[state=unchecked]:bg-muted group-disabled/switch:group-hover/switch:data-[state=unchecked]:bg-primary-foreground',
          'group-data-[size=default]/switch:size-4 group-data-[size=default]/switch:data-[state=checked]:translate-x-3',
          'group-data-[size=sm]/switch:size-3 group-data-[size=sm]/switch:data-[state=checked]:translate-x-2',
          'data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants, type SwitchProps }
