import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ActivityFeed, type ActivityEntry } from './activity-feed'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10722-1518'
const FIGMA_ENTRY = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10722-1546'

const ENTRIES: ActivityEntry[] = [
  {
    id: '1',
    kind: 'decision',
    title: 'Decided to weight pricing pages over analyst reports',
    meta: 'Fresher data · 14:07:31',
  },
  {
    id: '2',
    kind: 'discard',
    title: 'Discarded 2 sources from a content farm',
    meta: 'Low credibility · 14:07:15',
  },
  {
    id: '3',
    kind: 'extract',
    title: 'Extracted team-plan prices for 6 tools',
    meta: '1 table · 18 values · 14:07:02',
  },
  { id: '4', kind: 'read', title: 'Read the Northwind Sync pricing page', meta: '3 pages · 14:06:40' },
  {
    id: '5',
    kind: 'search',
    title: 'Searched “team plan pricing sync tools 2026”',
    meta: '12 results · 14:06:12',
    detail: 'pricing.example · plans.example · compare.example',
  },
  { id: '6', kind: 'read', title: 'Read the Meridian plan comparison', meta: '8 pages · 14:05:48' },
  {
    id: '7',
    kind: 'decision',
    title: 'Decided to skip paywalled analyst reports',
    meta: 'Two free sources cover the same data · 14:04:10',
  },
]

const meta = preview.meta({
  title: 'Agent Builder/Tasks/Activity Feed',
  tags: ['agent-builder'],
  component: ActivityFeed,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'loaded · loading · empty · invalid',
        code: '`status` prop: loaded · loading · empty · error',
      },
      {
        property: 'filter',
        values: 'all · decisions',
        code: '`filter` / `defaultFilter` / `onFilterChange` over `filters`',
      },
      {
        property: 'type (entry)',
        values: 'search · read · extract · discard · decision',
        code: '`entries[].kind`',
      },
      {
        property: 'footer',
        values: 'show earlier · export',
        code: '`moreLabel` + `onMore` · `onExport`',
      },
    ],
    guide: {
      use: [
        'A filterable stream of what the agent did during a task: searches, reads, extractions, discards and decisions.',
        'Let people filter to decisions or discards to see why the agent chose what it did.',
        'Expand an entry for its detail (the sources it touched); keep the rest of the row short.',
      ],
      avoid: [
        'The steps of the plan and their progress: use Progress Timeline.',
        'One tool call in a message: use Tool Call Item.',
        'A log for debugging: export it (Export log) instead of showing raw output.',
      ],
      content: [
        'Titles are past-tense actions (“Searched …”, “Discarded 2 sources …”); the meta line gives the result and the time.',
        'Decisions say what and why: “Decided to skip paywalled reports”, “Two free sources cover the same data”.',
        'Empty: say when entries will appear. Error: say what failed and that the task is unaffected.',
      ],
      a11y: [
        'The filters are a group of toggle buttons with `aria-pressed`; the list is named “Activity”.',
        'Expandable entries are buttons with `aria-expanded`; the type is shown by a glyph and the title, never colour alone.',
        'Loading, empty and error are announced as status.',
      ],
    },
    docs: {
      description: {
        component:
          'A filterable stream of agent actions (`@/components/agent/activity-feed`, on Task Card): `status` loaded · loading · empty · error, `entries`, `filters`, `filter`, `moreLabel`, `onExport`, `onRetry`.',
      },
    },
  },
  args: {
    status: 'loaded' as const,
    title: 'Activity',
    subtitle: 'Live · 64 actions · 11m 40s',
    badge: 'Live',
    entries: ENTRIES,
    moreLabel: 'Show 57 earlier actions',
    onMore: fn(),
    onExport: fn(),
    onRetry: fn(),
    onGetHelp: fn(),
    onDismissEmpty: fn(),
    onFilterChange: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['loaded', 'loading', 'empty', 'error'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    badge: { control: 'text' },
    entries: { control: 'object' },
    filters: { control: false },
    filter: { control: false },
    defaultFilter: { control: 'text' },
    moreLabel: { control: 'text' },
    emptyTitle: { control: 'text' },
    emptyDescription: { control: 'text' },
    onMore: { control: false, table: { category: 'Events' } },
    onExport: { control: false, table: { category: 'Events' } },
    onRetry: { control: false, table: { category: 'Events' } },
    onGetHelp: { control: false, table: { category: 'Events' } },
    onDismissEmpty: { control: false, table: { category: 'Events' } },
    onFilterChange: { control: false, table: { category: 'Events' } },
  },
})

/** Figma state loaded, filter all. */
export const Default = meta.story()

Default.test('filters to decisions and expands an entry', async ({ canvas, args }) => {
  await expect(canvas.getByRole('list', { name: 'Activity' }).children).toHaveLength(7)
  await userEvent.click(canvas.getByRole('button', { name: 'Decisions' }))
  await expect(canvas.getByRole('list', { name: 'Activity' }).children).toHaveLength(2)
  await expect(args.onFilterChange).toHaveBeenCalledWith('decisions')
  await userEvent.click(canvas.getByRole('button', { name: 'Decisions' }))
  await expect(canvas.getByRole('list', { name: 'Activity' }).children).toHaveLength(7)
  const search = canvas.getByRole('button', { name: /Searched/ })
  await userEvent.click(search)
  await expect(search).toHaveAttribute('aria-expanded', 'true')
})

/** Figma filter decisions. */
export const Decisions = meta.story({ args: { defaultFilter: 'decisions' } })

/** Figma state loading. */
export const Loading = meta.story({ args: { status: 'loading' } })

Loading.test('is a busy status', async ({ canvas }) => {
  await expect(canvas.getByRole('status')).toHaveAttribute('aria-busy', 'true')
})

/** Figma state empty. */
export const Empty = meta.story({ args: { status: 'empty' } })

Empty.test('says when entries will appear', async ({ canvas, args }) => {
  await expect(canvas.getByText('No activity yet')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Got it' }))
  await expect(args.onDismissEmpty).toHaveBeenCalledOnce()
})

/** Figma state invalid. */
export const Error = meta.story({ args: { status: 'error' } })

Error.test('offers Try again', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
  await expect(args.onRetry).toHaveBeenCalledOnce()
})

/** Figma kind: search, read, extract, discard, decision. */
export const Kinds = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_ENTRY } },
  args: {
    entries: [ENTRIES[4], ENTRIES[3], ENTRIES[2], ENTRIES[1], ENTRIES[0]],
    moreLabel: undefined,
    onExport: undefined,
  },
})
