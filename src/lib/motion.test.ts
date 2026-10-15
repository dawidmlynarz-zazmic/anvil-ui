import { describe, expect, it } from 'vitest'

import * as motion from './motion'

// The motion rules in docs/motion-foundations.md and scripts/check-motion.mjs, applied to the shared classes:
// every one sets a duration token and an easing, never a numeric duration or a bracket easing.
const entries = Object.entries(motion) as [string, string][]
// overlayNudge is a direction (slide-in-from-*), not timing.
const timed = entries.filter(([name]) => name !== 'overlayNudge')

describe('motion classes', () => {
  it('exports class strings only', () => {
    expect(entries.length).toBeGreaterThan(5)
    for (const [, value] of entries) expect(typeof value).toBe('string')
  })

  it.each(timed)('%s sets a duration token and an easing', (_name, value) => {
    expect(value).toMatch(/duration-\(--duration-(fast|base|slow)\)/)
    expect(value).toMatch(/ease-(out|in-out)/)
  })

  it.each(entries)('%s has no numeric duration, bracket easing or transition-all', (_name, value) => {
    expect(value).not.toMatch(/duration-\d/)
    expect(value).not.toMatch(/ease-\[/)
    expect(value).not.toMatch(/transition-all/)
  })

  it('the nudge slides in from the side the overlay opens on', () => {
    for (const side of ['top', 'right', 'bottom', 'left'])
      expect(motion.overlayNudge).toContain(`data-[side=${side}]:slide-in-from-`)
  })

  it('exits are one duration step shorter than entrances', () => {
    expect(motion.overlayMotion).toContain('data-[state=open]:duration-(--duration-base)')
    expect(motion.overlayMotion).toContain('data-[state=closed]:duration-(--duration-fast)')
    expect(motion.panelMotion).toContain('data-[state=open]:duration-(--duration-slow)')
    expect(motion.panelMotion).toContain('data-[state=closed]:duration-(--duration-base)')
    expect(motion.expandMotion).toContain('data-[state=open]:duration-(--duration-base)')
    expect(motion.expandMotion).toContain('data-[state=closed]:duration-(--duration-fast)')
  })

  it('enters with ease-out and exits with ease-in-out', () => {
    for (const value of [
      motion.overlayMotion,
      motion.panelMotion,
      motion.expandMotion,
      motion.accordionMotion,
    ]) {
      expect(value).toContain('data-[state=open]:ease-out')
      expect(value).toContain('data-[state=closed]:ease-in-out')
    }
  })

  it('modals and scrims share the small-overlay timing', () => {
    expect(motion.modalMotion).toBe(motion.overlayMotion)
  })
})
