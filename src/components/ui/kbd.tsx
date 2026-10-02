import { cn } from '@/lib/utils'

// Figma: Badge page → `badge/shortcut` (2534:31422). Keyboard shortcut hint (e.g. ⌘K) for menus,
// search and tooltips: 16px, 4px padding, --overlay-8, text/xs/semibold --muted-foreground, 10px icon.

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-4 w-fit min-w-4 items-center justify-center gap-0.5 rounded-sm bg-overlay-8 px-1 font-sans type-text-xs-semibold text-muted-foreground select-none',
        "[&_svg:not([class*='size-'])]:size-2.5",
        // shadcn: adapts inside a tooltip (inverse surface).
        '[[data-slot=tooltip-content]_&]:bg-overlay-inverse-16 [[data-slot=tooltip-content]_&]:text-foreground-inverse',
        className,
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <kbd data-slot="kbd-group" className={cn('inline-flex items-center gap-1', className)} {...props} />
}

export { Kbd, KbdGroup }
