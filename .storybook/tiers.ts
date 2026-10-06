// The four design-system tiers are the sidebar's main sections (after Foundations). Each
// component's meta carries exactly one tier tag (`tags: ['agent-block']`) matching its title's
// section; the docs page shows it as a badge, the sidebar's tag filter filters by it, and the
// Welcome catalog reads it from Storybook's index. scripts/check-stories.mjs checks both.

export const TIERS = [
  {
    tag: 'ui-component',
    short: 'UI',
    tier: 1,
    label: 'UI Component',
    description:
      'A shadcn/ui component themed with Anvil tokens, or an Anvil-only control at the same level.',
  },
  {
    tag: 'agent-primitive',
    short: 'Primitive',
    tier: 2,
    label: 'Agent Primitive',
    description: 'An atomic unit of an agent UI: one message part, indicator, chip or row.',
  },
  {
    tag: 'agent-block',
    short: 'Block',
    tier: 3,
    label: 'Agent Block',
    description: 'A composed, interactive agent feature built from primitives and UI components.',
  },
  {
    tag: 'agent-template',
    short: 'Template',
    tier: 4,
    label: 'Agent Template',
    description: 'A full layout or flow: a surface or template from the Figma file.',
  },
] as const

/** Section title of each tier in the sidebar (the first part of every story title). */
export const TIER_SECTIONS: Record<(typeof TIERS)[number]['tag'], string> = {
  'ui-component': 'UI Components',
  'agent-primitive': 'Agent Primitives',
  'agent-block': 'Agent Blocks',
  'agent-template': 'Agent Templates',
}

/**
 * Anvil-only UI components (no shadcn counterpart; outside the shadcn sync), code in
 * components/anvil. Shown as a badge on the docs page and in the Welcome catalog.
 */
export const CUSTOM_TAG = 'anvil-custom'

export type TierTag = (typeof TIERS)[number]['tag']

export function tierOf(tags: readonly string[] | undefined) {
  return TIERS.find((tier) => tags?.includes(tier.tag))
}

/**
 * One row of a component's Figma → code table (`parameters.figmaProps`): the Figma component
 * property, its values, and what it is in code (a prop, a selector, a slot or nothing).
 * Wrap code in backticks.
 */
export type FigmaProp = { property: string; values?: string; code: string }
