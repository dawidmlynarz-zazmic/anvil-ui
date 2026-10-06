// How Anvil sorts its components (docs/system-audit.md).
//
// - The LEVEL says what a component is and how reusable it is (Atomic Design): Atoms, Molecules,
//   Organisms, Agent Builder. It is the first part of every story title (`Molecules/Field`) and a
//   tag (`tags: ['molecule']`); each meta has exactly one.
// - The CONTEXT says where in an agent UI a component is used (Messages, Sources, …). It is an
//   optional tag, set only where it helps; generic components have none.
// - `parameters.shadcn` names the shadcn/ui counterpart (its docs slug), when there is one.
//
// The code stays flat (src/components/{ui,anvil,agent}); levels live here, never in folders.
// scripts/check-stories.mjs checks the rules.

export const LEVELS = [
  {
    tag: 'atom',
    title: 'Atoms',
    label: 'Atom',
    description: 'One element, context-agnostic. Uses no other Anvil component except Icon.',
  },
  {
    tag: 'molecule',
    title: 'Molecules',
    label: 'Molecule',
    description: 'A few atoms with one job: a field, a scale, a menu, a status strip.',
  },
  {
    tag: 'organism',
    title: 'Organisms',
    label: 'Organism',
    description:
      'A complete, reusable section with its own structure or interaction: overlays, navigation, data.',
  },
  {
    tag: 'agent-builder',
    title: 'Agent Builder',
    label: 'Agent Builder',
    description:
      'A ready-to-use agent experience built from the levels above, used as-is in an agent UI: a citation drawer, an approval, a survey.',
  },
] as const

export type LevelTag = (typeof LEVELS)[number]['tag']
export type LevelTitle = (typeof LEVELS)[number]['title']

export const CONTEXTS = [
  { tag: 'messages', label: 'Messages', description: 'The thread: messages, their parts and actions.' },
  {
    tag: 'input',
    label: 'Input',
    description: 'What the user sends: the composer, replies, files and voice.',
  },
  {
    tag: 'agent-status',
    label: 'Agent Status',
    description: 'What the agent is doing: thinking, tools, streaming.',
  },
  { tag: 'sources', label: 'Sources', description: 'Where an answer comes from: citations and sources.' },
  { tag: 'memory', label: 'Memory', description: 'What the agent remembers and the thread’s instructions.' },
  {
    tag: 'actions',
    label: 'Actions',
    description: 'Actions with side effects: approvals and connected apps.',
  },
  { tag: 'widgets', label: 'Widgets & Artifacts', description: 'Rich output: data, media and artifacts.' },
  { tag: 'feedback', label: 'Feedback', description: 'Asking the user how it went: ratings and surveys.' },
] as const

export type ContextTag = (typeof CONTEXTS)[number]['tag']

export function levelOf(tags: readonly string[] | undefined) {
  return LEVELS.find((level) => tags?.includes(level.tag))
}

export function contextsOf(tags: readonly string[] | undefined) {
  return CONTEXTS.filter((context) => tags?.includes(context.tag))
}

/** The shadcn/ui docs page for a `parameters.shadcn` slug. */
export const shadcnUrl = (slug: string) => `https://ui.shadcn.com/docs/components/${slug}`

/**
 * One row of a component's Figma → code table (`parameters.figmaProps`): the Figma component
 * property, its values, and what it is in code (a prop, a selector, a slot or nothing).
 * Wrap code in backticks.
 */
export type FigmaProp = { property: string; values?: string; code: string }
