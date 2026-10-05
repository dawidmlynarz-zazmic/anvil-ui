import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'

import type { Confidence } from './citation-chip'
import {
  CitationDrawer,
  CitationDrawerContent,
  CitationDrawerEmpty,
  CitationDrawerList,
  CitationDrawerLoading,
  CitationDrawerSearch,
  CitationDrawerTrigger,
} from './citation-drawer'
import { CitationSourceItem } from './citation-source-item'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-2792'

const SOURCES: { confidence?: Confidence; score?: string }[] = [
  { confidence: 'high', score: '92%' },
  { confidence: 'high', score: '92%' },
  { confidence: 'medium', score: '64%' },
  { confidence: 'medium', score: '64%' },
  { confidence: 'low', score: '31%' },
  {},
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
        title={`Title (${SOURCES.length})`}
        onOpenAutoFocus={focusOnOpen ? undefined : (e) => e.preventDefault()}
      >
        {search && <CitationDrawerSearch />}
        {body === 'loading' && <CitationDrawerLoading />}
        {body === 'empty' && <CitationDrawerEmpty>Subtitle</CitationDrawerEmpty>}
        {body === 'loaded' && (
          <CitationDrawerList>
            {SOURCES.map((source, i) => (
              <li key={i}>
                <CitationSourceItem
                  index={i + 1}
                  title="Title"
                  domain="Label"
                  path="/label/value"
                  snippet="Subtitle"
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
  title: 'Agent Blocks/Sources/Citation Drawer',
  tags: ['agent-block'],
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
        code: 'the body you render: `CitationDrawerLoading` · `CitationDrawerList` · `CitationDrawerEmpty` (not a prop)',
      },
    ],
    docs: {
      description: {
        component:
          'Every source behind an answer (`@/components/agent/citation-drawer`, on Sheet). `CitationDrawer` › `CitationDrawerTrigger` + `CitationDrawerContent` (`layout` side · bottom, `title`) › optional `CitationDrawerSearch`, then the body: `CitationDrawerList` of CitationSourceItems, `CitationDrawerLoading` or `CitationDrawerEmpty` (Figma state loading · loaded · empty is what you render). Selecting a source sets it `active`.',
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
  const drawer = await body.findByRole('dialog', { name: 'Title (6)' })
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
