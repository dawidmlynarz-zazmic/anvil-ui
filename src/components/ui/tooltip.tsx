import * as React from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { overlayNudge, tooltipMotion } from '@/lib/motion'

// Figma: Tooltip page → `tooltip` (27:95). Short, non-interactive label on hover or focus; use a
// hover card for rich previews and Popover for interactive content. --background-inverse with
// text/xs/medium --foreground-inverse, 4/8px padding, arrow, shadow/md. `side` → Radix side.
// Figma `variant` (default · fixed width · inline) is layout only: text wraps at max-w-xs, and the
// arrow is always shown.

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-(--z-tooltip) w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-sm bg-background-inverse px-2 py-1 type-text-xs-medium text-balance text-foreground-inverse shadow-md',
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          overlayNudge,
          tooltipMotion,
          className,
        )}
        {...props}
      >
        {children}
        {/* shadcn's arrow (a rotated square inside the content), in the tooltip color. */}
        <TooltipPrimitive.Arrow className="z-(--z-tooltip) size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-2xs bg-background-inverse fill-background-inverse" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
