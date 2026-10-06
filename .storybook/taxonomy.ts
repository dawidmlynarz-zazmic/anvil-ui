// How Anvil sorts its components (docs/composition-audit.md).
//
// - The sidebar SECTION says where a component lives: UI Components, Agent Primitives, Agent Blocks,
//   Agent Templates (the first part of every story title, after Welcome and Foundations).
// - The CATEGORY says how it is built: element, composite, feature or template (atomic design under
//   plain names). Every meta carries exactly one category tag (`tags: ['composite']`); the docs page
//   shows it as a badge and the sidebar's tag filter filters by it.
//
// Each section allows certain categories; scripts/check-stories.mjs checks both rules.

export const CATEGORIES = [
  {
    tag: 'element',
    label: 'Element',
    description: 'Can’t be split further without losing its meaning; uses no other component but Icon.',
  },
  {
    tag: 'composite',
    label: 'Composite',
    description: 'A few elements working as one unit with one job; no header, body or footer of its own.',
  },
  {
    tag: 'feature',
    label: 'Feature',
    description:
      'A distinct section of the interface, with its own structure or flow, built from composites.',
  },
  {
    tag: 'template',
    label: 'Template',
    description: 'A page-level layout that places features.',
  },
] as const

export type CategoryTag = (typeof CATEGORIES)[number]['tag']

export const SECTIONS = [
  {
    title: 'UI Components',
    categories: ['element', 'composite', 'feature'],
    description: 'shadcn/ui components themed with Anvil tokens, and Anvil-only controls.',
  },
  {
    title: 'Agent Primitives',
    categories: ['element', 'composite'],
    description: 'The agent UI’s elements and composites: message parts, indicators, chips, rows and menus.',
  },
  {
    title: 'Agent Blocks',
    categories: ['feature'],
    description: 'Agent features: composer, message row, approvals, connectors and other distinct sections.',
  },
  {
    title: 'Agent Templates',
    categories: ['template'],
    description: 'Surfaces and full layouts: where the agent lives.',
  },
] as const satisfies readonly { title: string; categories: readonly CategoryTag[]; description: string }[]

export type SectionTitle = (typeof SECTIONS)[number]['title']

export function categoryOf(tags: readonly string[] | undefined) {
  return CATEGORIES.find((category) => tags?.includes(category.tag))
}

/**
 * Anvil-only UI components (no shadcn counterpart; outside the shadcn sync), code in
 * components/anvil. Shown as a badge on the docs page and in the Welcome catalog.
 */
export const CUSTOM_TAG = 'anvil-custom'

/**
 * One row of a component's Figma → code table (`parameters.figmaProps`): the Figma component
 * property, its values, and what it is in code (a prop, a selector, a slot or nothing).
 * Wrap code in backticks.
 */
export type FigmaProp = { property: string; values?: string; code: string }
