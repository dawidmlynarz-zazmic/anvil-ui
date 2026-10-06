import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Label as LabelPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Forms page → `label` (10892:172), the one label atom for every form element: text/sm/medium
// (Figma updated; was text/xs), markers text/sm (required --danger, optional --muted-foreground).
// `marker` none · required · optional. Figma `state` follows the control, so it is selectors:
// disabled → 50% opacity (Field data-disabled, or a disabled peer control);
// invalid → destructive text (Field data-invalid, data-invalid on the label, or an aria-invalid peer).
// Invalid text uses --danger-medium, not Figma's --destructive: red/50 on the dark background is
// 3.25:1; --danger-medium is what Figma's own destructive outline/ghost buttons use for text.
const labelVariants = cva([
  'inline-flex items-center gap-1 type-text-sm-medium text-foreground select-none',
  'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
  'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
  'group-data-[invalid=true]/field:text-danger-medium data-[invalid=true]:text-danger-medium peer-aria-invalid:text-danger-medium',
])

const markerVariants = cva('', {
  variants: {
    marker: {
      none: 'hidden',
      required: 'type-text-sm-medium text-danger',
      optional: 'type-text-sm-normal text-muted-foreground',
    },
  },
})

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof markerVariants>

function Label({ className, marker = 'none', children, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      data-marker={marker}
      className={cn(labelVariants(), className)}
      {...props}
    >
      {children}
      {marker !== 'none' && (
        <span
          data-slot="label-marker"
          // The required asterisk is visual; the control's `required` attribute carries the meaning.
          aria-hidden={marker === 'required' || undefined}
          className={cn(markerVariants({ marker }), 'in-data-[invalid=true]:text-danger-medium')}
        >
          {marker === 'required' ? '*' : '(optional)'}
        </span>
      )}
    </LabelPrimitive.Root>
  )
}

export { Label, labelVariants, type LabelProps }
