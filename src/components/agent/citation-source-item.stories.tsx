import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { CitationSourceItem } from './citation-source-item'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10667-14149'

const SCORES = { high: '92%', medium: '64%', low: '31%' } as const

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Sources/Citation Source Item',
  tags: ['agent-primitive'],
  component: CitationSourceItem,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'source index', values: 'text', code: '`index` prop' },
      { property: 'title', values: 'text', code: '`title` prop' },
      { property: 'domain', values: 'text', code: '`domain` prop' },
      { property: 'url preview', values: 'text', code: '`path` prop' },
      { property: 'snippet / show snippet', values: 'text · boolean', code: 'pass `snippet` or not' },
      {
        property: 'state',
        values: 'default · hover · selected · focus',
        code: 'selectors: `hover:` · `data-[active=true]` (`active` prop) · `focus-visible:` (not a prop)',
      },
      {
        property: 'confidence',
        values: 'high · medium · low · none',
        code: '`confidence` + `score` props (omit for none)',
      },
    ],
    docs: {
      description: {
        component:
          'One source in the citation drawer (`@/components/agent/citation-source-item`): index, `title`, `domain` and `path`, optional `snippet`, and a confidence badge (`confidence` + `score`; omit for a dash). A button (selects the source; `active` = Figma selected, `aria-pressed`) or a link with `href` (`aria-current`). Hover and focus come from the State control.',
      },
    },
  },
  args: {
    index: 1,
    title: 'Title',
    domain: 'Label',
    path: '/label/value',
    snippet: 'Subtitle',
    confidence: 'high' as const,
    score: '92%',
    active: false,
    onClick: fn(),
  },
  argTypes: {
    index: { control: 'text' },
    title: { control: 'text' },
    domain: { control: 'text' },
    path: { control: 'text' },
    snippet: { control: 'text' },
    confidence: { control: 'inline-radio', options: ['high', 'medium', 'low'] },
    score: { control: 'text' },
    active: { control: 'boolean' },
    href: { control: 'text' },
    onClick: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <div className="w-100">
      <CitationSourceItem {...args} />
    </div>
  ),
})

/** Every field, confidence and active are in Controls. */
export const Default = meta.story()

Default.test('is a toggle button named by its source', async ({ canvas, args }) => {
  const item = canvas.getByRole('button', { name: /Source 1 Title/ })
  await expect(item).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(item)
  await expect(args.onClick).toHaveBeenCalledOnce()
})

/** Figma confidence (high, medium, low, none) × state (default, hover, selected, focus). */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['default', 'hover', 'selected', 'focus'] as const).map((state) =>
        (['high', 'medium', 'low', undefined] as const).map((confidence) => {
          const item = (
            <CitationSourceItem
              index={1}
              title="Title"
              domain="Label"
              path="/label/value"
              snippet="Subtitle"
              confidence={confidence}
              score={confidence && SCORES[confidence]}
              active={state === 'selected'}
            />
          )
          const pseudo =
            state === 'hover' ? 'pseudo-hover-all' : state === 'focus' ? 'pseudo-focus-visible-all' : ''
          return (
            <div key={`${state}-${confidence ?? 'none'}`} className={`w-100 ${pseudo}`}>
              {item}
            </div>
          )
        }),
      )}
    </div>
  ),
})

/** A list of sources, one selected (as in the drawer). */
export const List = meta.story({
  render: () => (
    <ul className="flex w-100 flex-col">
      {([1, 2, 3] as const).map((i) => (
        <li key={i}>
          <CitationSourceItem
            index={i}
            title="Title"
            domain="Label"
            path="/label/value"
            confidence={(['high', 'medium', 'low'] as const)[i - 1]}
            score={Object.values(SCORES)[i - 1]}
            active={i === 1}
          />
        </li>
      ))}
    </ul>
  ),
})

/** With `href` it is a link; `active` marks it as the current source. */
export const AsLink = meta.story({ args: { href: '#source-1', active: true } })

AsLink.test('a link marked current', async ({ canvas }) => {
  await expect(canvas.getByRole('link', { name: /Source 1 Title/ })).toHaveAttribute('aria-current', 'true')
})

const LONG =
  'A long title that wraps onto several lines to check spacing, alignment and wrapping in a narrow column'
const UNBROKEN = 'https://example.com/a/very/long/path/without/any/spaces/that/must/wrap/inside/the/column'

/** Stress test: long text and an unbroken URL in a narrow column wrap or truncate, never overflow. */
export const LongContent = meta.story({
  args: { title: LONG, domain: UNBROKEN, path: UNBROKEN, snippet: LONG },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

LongContent.test('stays in its column and keeps text readable', async ({ canvasElement }) => {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot=citation-source-item]')!
  const column = root.parentElement!.getBoundingClientRect()
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    await expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(column.right + 1)
    // A text block squeezed by its neighbours wraps one character per line.
    if (el.childElementCount === 0 && (el.textContent ?? '').length > 20) {
      await expect(el.getBoundingClientRect().width).toBeGreaterThanOrEqual(64)
    }
  }
})
