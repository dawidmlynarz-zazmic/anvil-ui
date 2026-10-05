import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Figma: Skeleton page → `skeleton` (10671:2510). A --muted loading placeholder that pulses (still
// with the motion toolbar off / prefers-reduced-motion). Figma `shape`: line (16px tall, radius lg) ·
// block (radius lg) · circle; size it with className like shadcn.
const skeletonVariants = cva('animate-pulse bg-muted motion-reduce:animate-none', {
  variants: {
    shape: {
      line: 'h-4 rounded-lg',
      block: 'rounded-lg',
      circle: 'aspect-square rounded-full',
    },
  },
  defaultVariants: { shape: 'block' },
})

function Skeleton({
  className,
  shape = 'block',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof skeletonVariants>) {
  return (
    <div
      data-slot="skeleton"
      data-shape={shape}
      className={cn(skeletonVariants({ shape }), className)}
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }
