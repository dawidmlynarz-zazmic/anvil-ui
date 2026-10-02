import * as React from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'

import {
  ShellCloseButton,
  ShellFooter,
  ShellHeader,
  shellDescriptionClassName,
  shellTitleClassName,
  type ShellFooterProps,
  type ShellHeaderProps,
} from '@/components/anvil/shell'
import { cn } from '@/lib/utils'

// Figma: Popover page → `popover` (10939:49). Floating panel anchored to a trigger for interactive
// content: ShellHeader (inline) + content + optional ShellFooter (inline). Width 288, padding 16,
// gap 12, radius lg, --overlay-4 stroke, elevation/raised. `side` / `align` → Radix placement.
// Use Tooltip for short non-interactive labels.

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverClose({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

// Radix Popover gives the content role="dialog" but no name; PopoverTitle / PopoverDescription
// register here so the content gets aria-labelledby / aria-describedby (like Radix Dialog).
type PopoverA11y = {
  titleId: string
  descriptionId: string
  register: (part: 'title' | 'description', on: boolean) => void
}
const PopoverA11yContext = React.createContext<PopoverA11y | null>(null)

function usePopoverPart(part: 'title' | 'description') {
  const ctx = React.useContext(PopoverA11yContext)
  React.useLayoutEffect(() => {
    ctx?.register(part, true)
    return () => ctx?.register(part, false)
  }, [ctx, part])
  return ctx ? (part === 'title' ? ctx.titleId : ctx.descriptionId) : undefined
}

const FOCUSABLE = 'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])'

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  onOpenAutoFocus,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const id = React.useId()
  const [parts, setParts] = React.useState({ title: false, description: false })
  const a11y = React.useMemo<PopoverA11y>(
    () => ({
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      register: (part, on) => setParts((p) => (p[part] === on ? p : { ...p, [part]: on })),
    }),
    [id],
  )

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        aria-labelledby={parts.title ? a11y.titleId : undefined}
        aria-describedby={parts.description ? a11y.descriptionId : undefined}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event)
          if (event.defaultPrevented || !(event.target instanceof HTMLElement)) return
          // The header close comes first; start on the first other control (e.g. a field).
          const first = event.target.querySelector<HTMLElement>(
            `:is(${FOCUSABLE}):not([data-slot=shell-close]):not(:disabled)`,
          )
          if (first) {
            event.preventDefault()
            first.focus()
          }
        }}
        className={cn(
          'z-(--z-popover) flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-3 rounded-lg bg-popover p-4 text-popover-foreground outline-hidden',
          'inset-ring inset-ring-overlay-4 shadow-elevation-raised',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      >
        <PopoverA11yContext.Provider value={a11y}>{props.children}</PopoverA11yContext.Provider>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

type PopoverHeaderProps = Omit<ShellHeaderProps, 'close' | 'variant'> & {
  /** Renders the close button at the end of the header (default true, as drawn). */
  showCloseButton?: boolean
}

/** ShellHeader, variant inline (the popover pads it). */
function PopoverHeader({ showCloseButton = true, ...props }: PopoverHeaderProps) {
  return (
    <ShellHeader
      data-slot="popover-header"
      variant="inline"
      close={
        showCloseButton ? (
          <PopoverPrimitive.Close asChild>
            <ShellCloseButton />
          </PopoverPrimitive.Close>
        ) : undefined
      }
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  const id = usePopoverPart('title')
  return <h2 id={id} data-slot="popover-title" className={cn(shellTitleClassName, className)} {...props} />
}

function PopoverDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const id = usePopoverPart('description')
  return (
    <p
      id={id}
      data-slot="popover-description"
      className={cn(shellDescriptionClassName, className)}
      {...props}
    />
  )
}

/** ShellFooter, variant inline. */
function PopoverFooter(props: Omit<ShellFooterProps, 'variant'>) {
  return <ShellFooter data-slot="popover-footer" variant="inline" {...props} />
}

export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  type PopoverHeaderProps,
}
