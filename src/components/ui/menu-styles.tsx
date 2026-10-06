import { cn } from '@/lib/utils'
import { overlayMotion, overlayNudge } from '@/lib/motion'

// Shared by Dropdown Menu and Context Menu: Figma draws one set of menu parts (Dropdown Menu page →
// `dropdown menu` 8257:3156, `dropdown item` 1650:28172, `dropdown title` 8308:2662) and a context
// menu is the same menu opened by right-click. Keep both menus on these so they cannot drift.

/** Figma menu: --popover, 1px --overlay-4 stroke, radius lg, 8px padding. Figma still uses shadow/lg
 * here; elevation/raised is the same value (CLAUDE.md → known gaps). */
export const menuContentClassName = cn(
  'z-(--z-popover) min-w-54 overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-2 text-popover-foreground',
  'inset-ring inset-ring-overlay-4 shadow-elevation-raised',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  overlayNudge,
  overlayMotion,
)

/** Figma `dropdown item`: 36px, radius md; highlighted → --muted, disabled → 50% (as drawn).
 * `intent="destructive"` text uses --danger-medium (Figma --danger is 3.25:1 on dark). */
export const menuItemClassName = cn(
  'group/item relative flex h-9 cursor-pointer items-center gap-2 rounded-md px-2 type-text-sm-normal text-foreground outline-hidden select-none',
  'data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8',
  'data-[intent=destructive]:text-danger-medium',
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
)

/** Figma `dropdown title`: section title row. */
export const menuLabelClassName = 'p-2 type-text-xs-medium text-foreground-subtle data-[inset]:pl-8'

export const menuSeparatorClassName = 'mx-2 my-2 h-px bg-border'

/** --foreground-subtle on the highlighted --muted row is 4.34:1; --muted-foreground passes. */
export const menuShortcutClassName =
  'ml-auto pl-2 type-text-xs-medium text-foreground-subtle in-data-[highlighted]:text-muted-foreground'

/** Figma type=checkbox: a small switch at the end shows the checked state (visual only; the item
 * itself is the menuitemcheckbox). */
export function MenuCheckboxSwitch({ slot }: { slot: string }) {
  return (
    <span
      aria-hidden
      data-slot={slot}
      className="ml-auto flex h-4 w-6 shrink-0 items-center rounded-full bg-background-medium p-0.5 inset-shadow-xs group-data-[state=checked]/item:bg-primary"
    >
      <span className="size-3 rounded-full bg-primary-foreground shadow-sm transition-[translate] duration-(--duration-fast) group-data-[state=checked]/item:translate-x-2" />
    </span>
  )
}
