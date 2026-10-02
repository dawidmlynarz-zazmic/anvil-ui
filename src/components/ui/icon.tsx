import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon, LucideProps } from 'lucide-react'

import { cn } from '@/lib/utils'

// Figma: Foundations → Icons (Lucide) page (6294:8671). Every glyph is Lucide, drawn at 16×16 with
// a constant 1.33px stroke (round caps and joins) in --foreground. This is the one place the system
// touches the icon library: components and apps render glyphs through <Icon> and import them from
// this module, never from lucide-react directly (ESLint enforces it).
//
// Size: without `size`, the icon is 16px but leaves sizing to its container, so components keep
// sizing icon children with `[&_svg:not([class*='size-'])]:size-*` (e.g. Button xs → 12px).
// An explicit `size` always wins. The stroke stays 1.33px at every size, as drawn in Figma.

// non-scaling-stroke keeps the stroke at 1.33 CSS px whatever size CSS gives the icon.
const iconVariants = cva(
  'pointer-events-none inline-block shrink-0 align-middle [&_*]:[vector-effect:non-scaling-stroke]',
  {
    variants: {
      size: {
        xs: 'size-3',
        default: 'size-4',
      },
      // Figma status / agent "default" tones are the base tone "for fills and icons".
      tone: {
        neutral: '',
        brand: 'text-primary',
        info: 'text-info',
        success: 'text-success',
        warning: 'text-warning',
        destructive: 'text-destructive',
        agent: 'text-agent',
      },
    },
  },
)

/** Figma Icons page: stroke 1.33px regardless of the rendered size. */
const ICON_STROKE_WIDTH = 1.33
/** Figma Icons page: 16×16 artboard. */
const ICON_SIZE = 16

type IconProps = Omit<LucideProps, 'size' | 'ref'> &
  VariantProps<typeof iconVariants> & {
    /** The glyph, imported from this module (e.g. `import { Icon, PlusIcon } from '@/components/ui/icon'`). */
    icon: LucideIcon
    /**
     * Accessible name. Omit for decorative icons (hidden from assistive tech, the default);
     * set it when the icon alone carries meaning.
     */
    label?: string
    ref?: React.Ref<SVGSVGElement>
  }

function Icon({
  icon: Glyph,
  size,
  tone,
  label,
  className,
  strokeWidth = ICON_STROKE_WIDTH,
  ...props
}: IconProps) {
  return (
    <Glyph
      data-slot="icon"
      data-size={size ?? undefined}
      // Width/height attributes give 16px by default; CSS from the container or `size` overrides.
      width={ICON_SIZE}
      height={ICON_SIZE}
      strokeWidth={strokeWidth}
      focusable="false"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      className={cn(iconVariants({ size, tone }), className)}
      {...props}
    />
  )
}

export { Icon, iconVariants, ICON_SIZE, ICON_STROKE_WIDTH, type IconProps }

// The glyph set: Lucide, re-exported so the icon library is swapped in one place.
// (Our `Icon` above takes precedence over lucide-react's own `Icon` export.)
export * from 'lucide-react'
