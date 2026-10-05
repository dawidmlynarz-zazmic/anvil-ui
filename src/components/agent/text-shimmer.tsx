import * as React from 'react'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma Agent Builder › Core Kit › text shimmer (10734:2762): status text in --muted-foreground with
// a --foreground highlight sweeping across (frames 1–3, looping), text/sm/medium. The `shimmer`
// utility (globals.css) draws it and stops under reduced motion. `asChild` shimmers another element.
function TextShimmer({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<'span'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'
  return <Comp data-slot="text-shimmer" className={cn('shimmer type-text-sm-medium', className)} {...props} />
}

export { TextShimmer }
