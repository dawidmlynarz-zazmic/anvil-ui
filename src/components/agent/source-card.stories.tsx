import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { SourceCard } from './source-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10713-887'

const CONFIDENCE = ['high', 'medium', 'low'] as const

const meta = preview.meta({
  title: 'Agent Primitives/Sources/Source Card',
  tags: ['composite'],
  component: SourceCard,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'publisher', values: 'text', code: '`publisher` prop' },
      { property: 'domain', values: 'text', code: '`meta` prop (domain · date)' },
      { property: 'title', values: 'text', code: '`title` prop' },
      { property: 'excerpt', values: 'text', code: '`excerpt` prop' },
      {
        property: 'credibility',
        values: 'high · medium · low',
        code: '`confidence` prop (one name for one concept, audit M9)',
      },
      { property: 'state', values: 'default · excluded', code: '`excluded` prop' },
    ],
    docs: {
      description: {
        component:
          'A source with its confidence and usage, for research and review flows (`@/components/agent/source-card`): `publisher`, `meta`, `icon`, `tag`, `title`, `excerpt`, `credibility` (high · medium · low), `usage`. Actions: Open (`href`) and Exclude (`onExclude`); `excluded` (Figma state excluded) shows the Excluded badge and Restore (`onRestore`).',
      },
    },
  },
  args: {
    publisher: 'Title',
    meta: 'label.com · 14 May 2026',
    tag: 'Label',
    title: 'Title',
    excerpt: 'Subtitle',
    confidence: 'high' as const,
    usage: 'Label',
    excluded: false,
    href: '#source',
  },
  argTypes: {
    confidence: { control: 'inline-radio', options: CONFIDENCE },
    publisher: { control: 'text' },
    meta: { control: 'text' },
    tag: { control: 'text' },
    title: { control: 'text' },
    excerpt: { control: 'text' },
    usage: { control: 'text' },
    excluded: { control: 'boolean' },
    href: { control: 'text' },
    icon: { control: false },
    onExclude: { control: false, table: { category: 'Events' } },
    onRestore: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <div className="w-130">
      <SourceCard {...args} onExclude={() => {}} onRestore={() => {}} />
    </div>
  ),
})

/** Every field, confidence and excluded are in Controls. */
export const Default = meta.story()

Default.test('names its confidence and offers Open and Exclude', async ({ canvas }) => {
  await expect(canvas.getByText('High confidence')).toBeVisible()
  await expect(canvas.getByRole('link', { name: 'Open source' })).toHaveAttribute('href', '#source')
  await expect(canvas.getByRole('button', { name: 'Exclude source' })).toBeEnabled()
})

/** Figma credibility (`confidence`) × state (default, excluded). */
export const Variants = meta.story({
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      {CONFIDENCE.map((confidence) =>
        [false, true].map((excluded) => (
          <div key={`${confidence}-${excluded}`} className="w-130">
            <SourceCard
              {...args}
              confidence={confidence}
              excluded={excluded}
              onExclude={() => {}}
              onRestore={() => {}}
            />
          </div>
        )),
      )}
    </div>
  ),
})

/** Exclude and Restore switch the card. */
export const Interactive = meta.story({
  render: function Render(args) {
    const [excluded, setExcluded] = useState(false)
    return (
      <div className="w-130">
        <SourceCard
          {...args}
          excluded={excluded}
          onExclude={() => setExcluded(true)}
          onRestore={() => setExcluded(false)}
        />
      </div>
    )
  },
})

Interactive.test('exclude, then restore', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Exclude source' }))
  await expect(canvas.getByText('Excluded')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Restore source' }))
  await expect(canvas.queryByText('Excluded')).not.toBeInTheDocument()
})

const LONG =
  'A long title that wraps onto several lines to check spacing, alignment and wrapping in a narrow column'
const UNBROKEN = 'https://example.com/a/very/long/path/without/any/spaces/that/must/wrap/inside/the/column'

/** Stress test: long text and an unbroken URL in a narrow column wrap or truncate, never overflow. */
export const LongContent = meta.story({
  args: { publisher: LONG, meta: UNBROKEN, title: LONG, excerpt: `${LONG} ${UNBROKEN}` },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

LongContent.test('stays in its column and keeps text readable', async ({ canvasElement }) => {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot=source-card]')!
  const column = root.parentElement!.getBoundingClientRect()
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    await expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(column.right + 1)
    // A text block squeezed by its neighbours wraps one character per line.
    if (el.childElementCount === 0 && (el.textContent ?? '').length > 20) {
      await expect(el.getBoundingClientRect().width).toBeGreaterThanOrEqual(64)
    }
  }
})
