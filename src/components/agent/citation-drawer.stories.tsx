import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'

import type { Confidence } from './citation-chip'
import {
  CitationDrawer,
  CitationDrawerContent,
  CitationDrawerList,
  CitationDrawerSearch,
  CitationDrawerTrigger,
} from './citation-drawer'
import { CitationSourceItem } from './citation-source-item'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-2792'

const SOURCES: {
  title: string
  domain: string
  path: string
  snippet: string
  confidence?: Confidence
  score?: string
}[] = [
  {
    title: 'Team plans for sync tools, compared',
    domain: 'marketpulse.example',
    path: '/reports/sync-tools-pricing-2026',
    snippet: 'Most sync tools price team plans per seat, between $8 and $14 a month.',
    confidence: 'high',
    score: '92%',
  },
  {
    title: 'Northwind Sync beta: what we learned',
    domain: 'northwind.example',
    path: '/blog/sync-beta-learnings',
    snippet: 'Beta teams that finished onboarding in the first week were twice as likely to convert.',
    confidence: 'high',
    score: '89%',
  },
  {
    title: '2026 developer tools survey',
    domain: 'devsurvey.example',
    path: '/2026/results',
    snippet: '61% of respondents say file sync is part of their daily workflow.',
    confidence: 'medium',
    score: '68%',
  },
  {
    title: 'Why trial conversion stalls after day three',
    domain: 'analyticsweekly.example',
    path: '/articles/trial-conversion',
    snippet: 'Onboarding emails sent on day two lift trial conversion by up to 0.8 points.',
    confidence: 'medium',
    score: '64%',
  },
  {
    title: 'Pricing pages that convert',
    domain: 'marketpulse.example',
    path: '/blog/pricing-pages',
    snippet: 'Annual discounts above 20% rarely change the plan teams choose.',
    confidence: 'low',
    score: '31%',
  },
  {
    title: 'Northwind Sync release notes',
    domain: 'northwind.example',
    path: '/blog/release-notes',
    snippet: 'Selective sync and shared folders are available on every plan.',
  },
]

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  layout?: 'side' | 'bottom'
  search?: boolean
  body?: 'loaded' | 'loading' | 'empty'
  focusOnOpen?: boolean
}

function Demo({
  open,
  onOpenChange,
  layout = 'side',
  search = false,
  body = 'loaded',
  focusOnOpen = true,
}: DemoProps) {
  const [selected, setSelected] = useState(1)
  return (
    <CitationDrawer open={open} onOpenChange={onOpenChange}>
      <CitationDrawerTrigger asChild>
        <Button variant="outline" intent="neutral">
          Open sources
        </Button>
      </CitationDrawerTrigger>
      <CitationDrawerContent
        layout={layout}
        status={body === 'loaded' ? 'ready' : body}
        emptyMessage="No sources for this answer. Sources appear here when Assistant searches the web or reads a file."
        title={`Sources (${SOURCES.length})`}
        onOpenAutoFocus={focusOnOpen ? undefined : (e) => e.preventDefault()}
      >
        {search && <CitationDrawerSearch />}
        {body === 'loaded' && (
          <CitationDrawerList>
            {SOURCES.map((source, i) => (
              <li key={i}>
                <CitationSourceItem
                  index={i + 1}
                  title={source.title}
                  domain={source.domain}
                  path={source.path}
                  snippet={source.snippet}
                  confidence={source.confidence}
                  score={source.score}
                  active={selected === i + 1}
                  onClick={() => setSelected(i + 1)}
                />
              </li>
            ))}
          </CitationDrawerList>
        )}
      </CitationDrawerContent>
    </CitationDrawer>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Citation Drawer',
  tags: ['agent-builder', 'sources'],
  component: Demo,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'title', values: 'text', code: '`title` prop on `CitationDrawerContent`' },
      { property: 'show search', values: 'boolean', code: 'render `CitationDrawerSearch` or not' },
      {
        property: 'source list',
        values: 'instance',
        code: '`CitationDrawerList` of `CitationSourceItem` children',
      },
      { property: 'layout', values: 'side · bottom', code: '`layout` prop on `CitationDrawerContent`' },
      {
        property: 'state',
        values: 'loading · loaded · empty',
        code: '`status` loading · ready (your `CitationDrawerList`) · empty (`emptyMessage`)',
      },
    ],
    guide: {
      use: [
        'Every source behind one answer, opened from a “Sources” button or the citations row under the message.',
        '`layout="side"` on desktop next to the thread; bottom on mobile.',
        'Add `CitationDrawerSearch` when an answer can cite more than about eight sources.',
      ],
      avoid: [
        'A quick check of one citation: use Citation Hovercard on the chip.',
        'Reviewing and excluding sources in a research flow: use Source Card.',
        'Showing sources the agent didn’t cite: list only what supports this answer.',
      ],
      content: [
        'Title: “Sources” plus the count (“Sources (6)”).',
        'Each item: the page title, domain and path, and the snippet that was cited; order by relevance, as cited.',
        'Empty: say what is empty and when sources appear (“Sources appear here when Assistant searches the web…”).',
      ],
      a11y: [
        'It is a Sheet dialog: focus moves in on open, Escape closes, and focus returns to the trigger.',
        'Source items are toggle buttons with `aria-pressed` for the selected one.',
        'Loading is a status named “Loading sources”.',
      ],
    },
    docs: {
      description: {
        component:
          'Every source behind an answer (`@/components/agent/citation-drawer`, on Sheet). `CitationDrawer` › `CitationDrawerTrigger` + `CitationDrawerContent` (`layout` side · bottom, `title`) › optional `CitationDrawerSearch`, then the body: `status` ready shows your `CitationDrawerList` of CitationSourceItems; loading shows skeleton rows; empty shows an Empty State with `emptyMessage` (Figma state loading · loaded · empty). Selecting a source sets it `active`.',
      },
      story: { inline: false, height: '720px' },
    },
  },
  args: { open: false, layout: 'side', search: false, body: 'loaded' },
  argTypes: {
    open: { control: 'boolean' },
    onOpenChange: { control: false, table: { category: 'Events' } },
    search: { control: 'boolean' },
    layout: { control: 'inline-radio', options: ['side', 'bottom'] },
    body: { control: 'inline-radio', options: ['loaded', 'loading', 'empty'] },
    focusOnOpen: { table: { disable: true } },
  },
})

/** Open, layout, search and body are in Controls. */
export const Default = meta.story()

Default.test('opens from the trigger; selecting a source marks it', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Open sources' }))
  const body = within(canvasElement.ownerDocument.body)
  const drawer = await body.findByRole('dialog', { name: 'Sources (6)' })
  const items = within(drawer).getAllByRole('button', { name: /^Source/ })
  await expect(items).toHaveLength(6)
  await userEvent.click(items[2])
  await expect(items[2]).toHaveAttribute('aria-pressed', 'true')
  await expect(items[0]).toHaveAttribute('aria-pressed', 'false')
})

/** Figma layout side, loaded, open on load. */
export const Side = meta.story({ args: { open: true, focusOnOpen: false } })

/** Figma layout bottom (mobile). */
export const Bottom = meta.story({ args: { open: true, layout: 'bottom', focusOnOpen: false } })

/** Figma state loading. */
export const Loading = meta.story({ args: { open: true, body: 'loading', focusOnOpen: false } })

Loading.test('announces loading', async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await expect(await body.findByRole('status', { name: 'Loading sources' })).toBeInTheDocument()
})

/** Figma state empty. */
export const Empty = meta.story({ args: { open: true, body: 'empty', focusOnOpen: false } })

/** Figma show search. */
export const WithSearch = meta.story({ args: { open: true, search: true, focusOnOpen: false } })
