// Motion classes shared by the overlays (docs/motion-foundations.md §2). tw-animate-css's
// animate-in / animate-out read Tailwind's duration-* and ease-*; without them they fall back to
// 150ms and the browser's `ease`, so every archetype sets both. Exits are one duration step
// shorter than entrances and use ease-in-out. Reduced motion is global (globals.css).

/** Small overlays (Popover, menus, Select, Hover Card): base + ease-out in, fast + ease-in-out out. */
export const overlayMotion =
  'data-[state=open]:duration-(--duration-base) data-[state=open]:ease-out data-[state=closed]:duration-(--duration-fast) data-[state=closed]:ease-in-out'

/** The 4px nudge from the side a small overlay opens on. */
export const overlayNudge =
  'data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1'

/** Modals (Dialog, Alert Dialog) and every overlay scrim: same timing as small overlays. */
export const modalMotion = overlayMotion

/** Edge panels (Sheet): slow + ease-out in, base + ease-in-out out. */
export const panelMotion =
  'data-[state=open]:duration-(--duration-slow) data-[state=open]:ease-out data-[state=closed]:duration-(--duration-base) data-[state=closed]:ease-in-out'

/** Tooltip: fast both ways (it opens with delayed-open / instant-open, not open). */
export const tooltipMotion = 'duration-(--duration-fast) ease-out data-[state=closed]:ease-in-out'
