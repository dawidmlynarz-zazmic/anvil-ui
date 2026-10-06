import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

import {
  ShellBody,
  ShellCloseButton,
  ShellFooter,
  ShellHeader,
  shellDescriptionClassName,
  shellTitleClassName,
  type ShellFooterProps,
  type ShellHeaderProps,
} from '@/components/anvil/shell'
import { cn } from '@/lib/utils'
import { modalMotion } from '@/lib/motion'

// Figma: Dialog · Sheet · Drawer page → `drawer` (10935:40687). Bottom panel for the mobile shell,
// dragged or swiped to dismiss (vaul); use it instead of Dialog or Sheet below 768px. Handle (48×4
// --border-strong grabber, padding 12 / 4) → ShellHeader (bar) → body (ShellBody) → ShellFooter
// (bar; `align="stretch"` for full-width mobile actions). --background, 1px --overlay-16 stroke,
// top radius 2xl (16), elevation/modal over --overlay.

function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'fixed inset-0 z-(--z-overlay) bg-overlay',
        modalMotion,
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Content> & {
  /** The header close button (Figma .shell header close). Swipe and Escape dismiss it as well. */
  showCloseButton?: boolean
}

// The close button is rendered last (initial focus lands on the first body control) and positioned
// into the header bar, below the handle on a bottom drawer.
function DrawerContent({ className, children, showCloseButton = true, ...props }: DrawerContentProps) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        data-close-button={showCloseButton || undefined}
        className={cn(
          'group/drawer-content fixed z-(--z-modal) flex h-auto flex-col bg-background text-foreground outline-none',
          // A real border (Figma inside stroke): an inset ring is painted under the header and footer
          // bars' backgrounds, which left the outline around the body only.
          'border border-overlay-16 shadow-elevation-modal',
          // Vaul animates with its own keyframes (500ms, its own curve): use the edge-panel timing
          // (docs/motion-foundations.md) — slow + ease-out in, base + ease-in-out out.
          '[animation-duration:var(--duration-slow)]! [animation-timing-function:var(--ease-out)]! data-[state=closed]:[animation-duration:var(--duration-base)]! data-[state=closed]:[animation-timing-function:var(--ease-in-out)]!',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80dvh] data-[vaul-drawer-direction=top]:rounded-b-2xl',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80dvh] data-[vaul-drawer-direction=bottom]:rounded-t-2xl',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-sm',
          className,
        )}
        {...props}
      >
        <div
          data-slot="drawer-handle"
          aria-hidden
          className="mx-auto mt-3 mb-1 hidden h-1 w-12 shrink-0 rounded-2xs bg-border-strong group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
        />
        {children}
        {showCloseButton && (
          <DrawerPrimitive.Close asChild>
            <ShellCloseButton
              data-slot="drawer-close-button"
              className="absolute top-2 right-2 group-data-[vaul-drawer-direction=bottom]/drawer-content:top-7"
            />
          </DrawerPrimitive.Close>
        )}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

/** ShellHeader (bar); leaves room for the content's close button. */
function DrawerHeader({ className, ...props }: Omit<ShellHeaderProps, 'close'>) {
  return (
    <ShellHeader
      data-slot="drawer-header"
      className={cn('in-data-close-button:pr-12', className)}
      {...props}
    />
  )
}

/** Figma `content` slot (ShellBody): 16px padding and gap, scrolls. */
function DrawerBody(props: React.ComponentProps<'div'>) {
  return <ShellBody data-slot="drawer-body" {...props} />
}

/** ShellFooter (bar), pinned to the bottom (shadcn `mt-auto`). */
function DrawerFooter({ className, ...props }: ShellFooterProps) {
  return <ShellFooter data-slot="drawer-footer" className={cn('mt-auto', className)} {...props} />
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(shellTitleClassName, className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn(shellDescriptionClassName, className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
