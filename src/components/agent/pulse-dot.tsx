import * as React from 'react'

import { cn } from '@/lib/utils'

// Figma Agent Builder › Core Kit › pulse dot (10667:13158): a 12px frame with an 8px --agent dot
// that swells to 11px at 40% and back (frames 1–3, looping). Built on the Spinner pattern: with a
// `label` it is a status (role="status"); without one it is decorative, for use next to text that
// already says what is happening (thinking panel, tool call).
function PulseDot({ label, className, ...props }: React.ComponentProps<'span'> & { label?: string }) {
  return (
    <span
      data-slot="pulse-dot"
      {...(label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true })}
      className={cn('inline-flex size-3 shrink-0 items-center justify-center', className)}
      {...props}
    >
      <span className="size-2 animate-pulse-dot rounded-full bg-agent" />
    </span>
  )
}

export { PulseDot }
