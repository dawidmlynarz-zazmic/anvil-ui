import * as React from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Forms page → `slider` (10946:184). `mode` single · range is the shape of `value` (one or two
// numbers), as in shadcn. Track 6px --muted, range --primary, thumb 16px --background with a 1px
// --primary stroke. `state` → selectors: focus → focus-visible:focus-ring on the thumb, disabled →
// 50% (as drawn); hover is drawn the same as default.

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  tone = 'brand',
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** The range colour: brand (--primary, as Figma) · agent (the agent's own limits, e.g. Run Limits). */
  tone?: 'brand' | 'agent'
}) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
            tone === 'agent' ? 'bg-agent' : 'bg-primary',
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          // Radix puts role="slider" on each thumb; give it the name set on the Slider.
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={cn(
            'block size-4 shrink-0 rounded-full border bg-background',
            tone === 'agent' ? 'border-agent' : 'border-primary',
            ' transition-[box-shadow] duration-(--duration-fast) ease-out focus-visible:focus-ring focus-visible:outline-hidden disabled:pointer-events-none',
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
