import * as React from 'react'

import { cn } from '@/lib/utils'

// Figma Agent Builder › Core Kit › voice waveform (10664:12496): live audio while listening. 20 bars,
// 3px wide, 3px apart, radius 2xs, --foreground-link, centred in a 24px row; each breathes between
// its Figma frame heights (frames 1–3, looping) with a staggered delay. `active` false freezes it;
// reduced motion shows frame 1. Decorative unless `label` names it (role="img").

// Figma frame 1 bar heights (px, of 24).
const HEIGHTS = [6, 12, 18, 10, 22, 14, 8, 16, 20, 12, 6, 14, 18, 10, 16, 8, 12, 20, 14, 6]

function VoiceWaveform({
  active = true,
  label,
  className,
  ...props
}: React.ComponentProps<'div'> & { active?: boolean; label?: string }) {
  return (
    <div
      data-slot="voice-waveform"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      className={cn('flex h-6 w-fit items-center gap-0.75', className)}
      {...props}
    >
      {HEIGHTS.map((height, i) => (
        <span
          key={i}
          className={cn('w-0.75 shrink-0 rounded-2xs bg-foreground-link', active && 'animate-waveform')}
          style={{ height: `${(height / 24) * 100}%`, animationDelay: `${-(i % 5) * 0.18}s` }}
        />
      ))}
    </div>
  )
}

export { VoiceWaveform }
