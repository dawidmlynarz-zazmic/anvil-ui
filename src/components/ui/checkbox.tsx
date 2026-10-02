import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { CheckIcon, Icon, MinusIcon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Forms page → `checkbox` (8230:1312) on `.checkbox-base` (1629:2099). A bare 20px control;
// pair it with an inline Label (or a horizontal Field for a description / error). `checked`
// false · true · indeterminate → data-[state=unchecked|checked|indeterminate].
// Figma `state` → selectors: hover → hover:, focus → focus-visible: (focus/ring), invalid →
// aria-invalid: (destructive stroke while unchecked), disabled → disabled: (unchecked draws a
// disabled fill; checked is the primary fill at 30%). The stroke is an inset ring (inside stroke).
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer grid size-5 shrink-0 place-content-center rounded-sm outline-none',
        'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out',
        // unchecked
        'bg-background inset-ring inset-ring-input shadow-xs',
        'hover:inset-ring-border-strong focus-visible:inset-ring-border-strong focus-visible:focus-ring',
        'aria-invalid:inset-ring-destructive',
        // checked / indeterminate
        'data-[state=checked]:bg-primary data-[state=checked]:inset-ring-0 data-[state=indeterminate]:bg-primary data-[state=indeterminate]:inset-ring-0',
        'data-[state=checked]:hover:bg-button-primary-hover data-[state=indeterminate]:hover:bg-button-primary-hover',
        'data-[state=checked]:focus-visible:bg-button-primary-hover data-[state=indeterminate]:focus-visible:bg-button-primary-hover',
        // disabled
        'disabled:cursor-not-allowed disabled:shadow-none disabled:hover:inset-ring-input',
        'data-[state=unchecked]:disabled:bg-background-disabled',
        'data-[state=checked]:disabled:opacity-30 data-[state=checked]:disabled:hover:bg-primary data-[state=indeterminate]:disabled:opacity-30 data-[state=indeterminate]:disabled:hover:bg-primary',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator grid place-content-center text-foreground-inverse"
      >
        {/* Figma: 13px icons (the Icon stroke stays 1.33px) in --foreground-inverse. */}
        <Icon icon={CheckIcon} className="size-3.25 group-data-[state=indeterminate]/indicator:hidden" />
        <Icon
          icon={MinusIcon}
          className="hidden size-3.25 group-data-[state=indeterminate]/indicator:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
