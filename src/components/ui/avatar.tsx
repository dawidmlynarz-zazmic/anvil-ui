import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Avatar as AvatarPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Avatar page → `avatar` (1588:22579), `avatar group` (2626:5210), `.more-indicator`.
// `size` xs · sm · default · lg = 24 / 32 / 40 / 48; Figma `round` on/off → `shape` circle · square
// (radius sm · md · lg · xl by size). Figma `type` is the content: img → AvatarImage (--overlay-4
// stroke); text, icon, brand → AvatarFallback `tone` warning (text: --warning-soft, --warning-medium
// semibold initials) · agent (icon: --agent-subtle, --agent) · neutral (brand: --background with an
// --overlay-16 stroke). Group: avatars overlap by 8px (6px at xs) with a --background ring; the
// count is the .more-indicator (--accent, semibold, --accent-foreground: Figma's
// --foreground-subtle on --accent is 3.97:1, --muted-foreground is 3.98:1 in dark).

const avatarVariants = cva(
  [
    'group/avatar relative flex shrink-0 overflow-hidden select-none',
    // Figma img: an --overlay-4 inner stroke over the photo.
    'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] has-data-[slot=avatar-image]:after:inset-ring has-data-[slot=avatar-image]:after:inset-ring-overlay-4',
  ],
  {
    variants: {
      size: {
        xs: 'size-6',
        sm: 'size-8',
        default: 'size-10',
        lg: 'size-12',
      },
      shape: {
        circle: 'rounded-full',
        square: '',
      },
    },
    compoundVariants: [
      { shape: 'square', size: 'xs', className: 'rounded-sm' },
      { shape: 'square', size: 'sm', className: 'rounded-md' },
      { shape: 'square', size: 'default', className: 'rounded-lg' },
      { shape: 'square', size: 'lg', className: 'rounded-xl' },
    ],
    defaultVariants: { size: 'default', shape: 'circle' },
  },
)

function Avatar({
  className,
  size = 'default',
  shape = 'circle',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      className={cn(avatarVariants({ size, shape }), className)}
      {...props}
    />
  )
}

/** Figma type=img: the photo, with an --overlay-4 inner stroke. */
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  )
}

/** Shared by the fallback and the group count: text style and icon size follow the avatar size. */
const avatarTextClassName = cn(
  'flex size-full items-center justify-center rounded-[inherit]',
  'type-text-sm-semibold group-data-[size=lg]/avatar:type-text-base-semibold group-data-[size=sm]/avatar:type-text-xs-semibold group-data-[size=xs]/avatar:type-text-2xs-semibold',
  '[&>svg]:size-5 group-data-[size=lg]/avatar:[&>svg]:size-6 group-data-[size=sm]/avatar:[&>svg]:size-4 group-data-[size=xs]/avatar:[&>svg]:size-3',
)

const avatarFallbackVariants = cva(avatarTextClassName, {
  variants: {
    tone: {
      warning: 'bg-warning-soft text-warning-medium',
      agent: 'bg-agent-subtle text-agent',
      neutral: 'bg-background text-foreground inset-ring inset-ring-overlay-16',
    },
  },
  defaultVariants: { tone: 'warning' },
})

/** Figma type=text (initials, tone warning), icon (tone agent) or brand (tone neutral). */
function AvatarFallback({
  className,
  tone = 'warning',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & VariantProps<typeof avatarFallbackVariants>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      data-tone={tone}
      className={cn(avatarFallbackVariants({ tone }), className)}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none',
        'group-data-[size=xs]/avatar:size-2 group-data-[size=xs]/avatar:[&>svg]:hidden',
        'group-data-[size=sm]/avatar:size-2.5 group-data-[size=sm]/avatar:[&>svg]:size-2',
        'group-data-[size=default]/avatar:size-3 group-data-[size=default]/avatar:[&>svg]:size-2',
        'group-data-[size=lg]/avatar:size-3.5 group-data-[size=lg]/avatar:[&>svg]:size-2.5',
        className,
      )}
      {...props}
    />
  )
}

/** Figma avatar group: overlapping avatars with a --background ring. */
function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'group/avatar-group flex -space-x-2 has-data-[size=xs]:-space-x-1.5',
        '*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
        className,
      )}
      {...props}
    />
  )
}

/** Figma .more-indicator: "+N" in an --accent circle sized like the group's avatars. */
function AvatarGroupCount({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        'group/avatar relative flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground ring-2 ring-background',
        'type-text-sm-semibold [&>svg]:size-5',
        'group-has-data-[size=lg]/avatar-group:size-12 group-has-data-[size=lg]/avatar-group:type-text-base-semibold',
        'group-has-data-[size=sm]/avatar-group:size-8 group-has-data-[size=sm]/avatar-group:type-text-xs-semibold group-has-data-[size=sm]/avatar-group:[&>svg]:size-4',
        'group-has-data-[size=xs]/avatar-group:size-6 group-has-data-[size=xs]/avatar-group:type-text-2xs-semibold group-has-data-[size=xs]/avatar-group:[&>svg]:size-3',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount, avatarVariants }
