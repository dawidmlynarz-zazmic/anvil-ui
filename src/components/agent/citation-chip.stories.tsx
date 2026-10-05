import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { GlobeIcon, Icon } from '@/components/ui/icon'

import { CitationChip } from './citation-chip'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-2525'

const CONFIDENCES = ['high', 'medium', 'low', undefined] as const

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Sources/Citation Chip',
  tags: ['agent-primitive'],
  component: CitationChip,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'source index', values: 'text', code: '`index` prop' },
      { property: 'domain', values: 'text', code: '`domain` prop' },
      { property: 'show favicon · favicon', values: 'boolean · instance', code: 'pass `favicon` or not' },
      { property: 'display', values: 'index · domain', code: 'pass `domain` or not (not a prop)' },
      {
        property: 'state',
        values: 'default · hover · selected',
        code: 'selectors: `hover:` · `data-[active=true]` (`active` prop) / `data-[state=open]` (not a prop)',
      },
      {
        property: 'confidence',
        values: 'high · medium · low · none',
        code: '`confidence` prop (omit for none)',
      },
    ],
    docs: {
      description: {
        component:
          'An inline marker that links a claim to its source (`@/components/agent/citation-chip`). A button with the source `index`, an optional `domain` and `favicon`, and a `confidence` dot (high · medium · low; omit for none). `active` marks the source shown in the drawer (Figma selected); as a Hover Card or Popover trigger it takes the same look while open. Figma display index · domain = pass `domain` or not.',
      },
    },
  },
  args: { index: 1, domain: '', confidence: 'high' as const, active: false, onClick: fn() },
  argTypes: {
    index: { control: 'text' },
    domain: { control: 'text' },
    confidence: { control: 'inline-radio', options: ['high', 'medium', 'low'] },
    favicon: { control: false },
    active: { control: 'boolean' },
    onClick: { control: false, table: { category: 'Events' } },
  },
})

/** Index, domain, confidence and active are in Controls. */
export const Default = meta.story()

Default.test('is a button named by source and confidence', async ({ canvas, args }) => {
  const chip = canvas.getByRole('button', { name: 'Source 1 High confidence' })
  await userEvent.click(chip)
  await expect(args.onClick).toHaveBeenCalledOnce()
})

/** Figma display × confidence × state (default, hover, selected). */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col gap-3">
      {(['index', 'domain'] as const).map((display) =>
        (['default', 'hover', 'selected'] as const).map((state) => (
          <div key={`${display}-${state}`} className="flex items-center gap-3">
            {CONFIDENCES.map((confidence) => {
              const chip = (
                <CitationChip
                  key={confidence ?? 'none'}
                  index={1}
                  domain={display === 'domain' ? 'Label' : undefined}
                  confidence={confidence}
                  active={state === 'selected'}
                />
              )
              return state === 'hover' ? (
                <span key={confidence ?? 'none'} className="pseudo-hover-all contents">
                  {chip}
                </span>
              ) : (
                chip
              )
            })}
          </div>
        )),
      )}
    </div>
  ),
})

/** Figma show favicon: a 12px icon or image before the index. */
export const WithFavicon = meta.story({
  args: { domain: 'Label', favicon: <Icon icon={GlobeIcon} className="text-muted-foreground" /> },
})

/** Inline in an answer, after the claims they support. */
export const InText = meta.story({
  render: () => (
    <div className="w-120">
      <Bubble variant="ghost">
        <BubbleContent>
          Subtitle <CitationChip index={1} confidence="high" /> Subtitle{' '}
          <CitationChip index={2} confidence="medium" /> Subtitle <CitationChip index={3} confidence="low" />
        </BubbleContent>
      </Bubble>
    </div>
  ),
})

InText.test('each chip is its own button', async ({ canvas }) => {
  await expect(canvas.getAllByRole('button')).toHaveLength(3)
})
