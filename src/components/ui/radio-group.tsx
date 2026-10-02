import * as React from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Forms page → `radio button` (8230:2112) on `.radio-button-base` (8230:2161). Items are bare
// 20px controls with an inline Label; label the group with a Field / FieldSet. `checked` →
// data-[state=checked]. Figma `state` → selectors: hover → hover:, focus → focus-visible:
// (focus/ring), disabled → disabled: (unchecked draws a disabled fill; checked is primary at 30%).
// No invalid state is drawn for radio buttons. `orientation` vertical · horizontal (Radix).

function RadioGroup({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      orientation={orientation}
      className={cn(
        'flex gap-3 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'peer grid aspect-square size-5 shrink-0 place-content-center rounded-full outline-none',
        'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out',
        // unchecked
        'bg-background inset-ring inset-ring-input shadow-xs',
        'hover:inset-ring-border-strong focus-visible:inset-ring-border-strong focus-visible:focus-ring',
        // checked
        'data-[state=checked]:bg-primary data-[state=checked]:inset-ring-0',
        'data-[state=checked]:hover:bg-button-primary-hover data-[state=checked]:focus-visible:bg-button-primary-hover',
        // disabled
        'disabled:cursor-not-allowed disabled:shadow-none disabled:hover:inset-ring-input',
        'data-[state=unchecked]:disabled:bg-background-disabled',
        'data-[state=checked]:disabled:opacity-30 data-[state=checked]:disabled:hover:bg-primary',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        // Figma: 8px dot in --primary-foreground.
        className="size-2 rounded-full bg-primary-foreground"
      />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
