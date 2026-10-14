import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icon, MinusIcon, PlusIcon } from '@/components/ui/icon'

// Figma Forms › stepper (10668:16342): a numeric − / + control for quantities (tickets, guests, cart
// lines), shadcn "Input type=number + buttons" without the free typing: two outline Buttons (size sm,
// 40 × 32, a 16px glyph) either side of the value (text/sm/medium, 32px wide, tabular). Figma state
// default · min · max → not a prop: the decrement button is `disabled` at `min`, the increment at
// `max` (Figma draws them at 40%; Button's disabled look is used).
// - `value` / `defaultValue` / `onValueChange`: controlled or not; `min` (0) · `max` · `step` (1).
// - `label` names the control for assistive tech: the group is “label”, the buttons “Decrease label” /
//   “Increase label”, and the value is an `<output>` that announces changes politely.
// - `disabled` disables the whole control.

function Stepper({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = Infinity,
  step = 1,
  label,
  disabled,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Names the control: “Adult tickets”. */
  label?: string
  disabled?: boolean
}) {
  const [inner, setInner] = React.useState(defaultValue)
  const value = valueProp ?? inner
  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next))
    if (clamped === value) return
    if (valueProp === undefined) setInner(clamped)
    onValueChange?.(clamped)
  }
  return (
    <div
      data-slot="stepper"
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    >
      <Button
        variant="outline"
        intent="neutral"
        size="sm"
        disabled={disabled || value <= min}
        aria-label={label ? `Decrease ${label}` : 'Decrease'}
        onClick={() => set(value - step)}
      >
        <Icon icon={MinusIcon} />
      </Button>
      <output
        data-slot="stepper-value"
        aria-live="polite"
        className="min-w-8 px-1 text-center type-text-sm-medium text-foreground tabular-nums"
      >
        {value}
      </output>
      <Button
        variant="outline"
        intent="neutral"
        size="sm"
        disabled={disabled || value >= max}
        aria-label={label ? `Increase ${label}` : 'Increase'}
        onClick={() => set(value + step)}
      >
        <Icon icon={PlusIcon} />
      </Button>
    </div>
  )
}

export { Stepper }
