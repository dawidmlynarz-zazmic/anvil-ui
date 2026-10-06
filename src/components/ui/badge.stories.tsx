import preview from '#.storybook/preview'
import type { ReactNode } from 'react'
import { expect } from 'storybook/test'

import { Badge } from './badge'
import { Icon, ClockIcon, SparklesIcon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=1482-30693'
const FIGMA_STATUS = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8399-1766'
const variants = ['default', 'subtle', 'outline'] as const
const tones = ['neutral', 'brand', 'info', 'success', 'warning', 'destructive', 'agent'] as const
const sizes = ['default', 'sm', 'xs'] as const

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 p-3">{children}</div>
}

const meta = preview.meta({
  title: 'Atoms/Badge',
  tags: ['atom'],
  component: Badge,
  parameters: {
    shadcn: 'badge',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'variant',
        values: 'default · outline · subtle',
        code: '`variant` default (solid) · subtle · outline, for every `tone`',
      },
      {
        property: 'intent',
        values: 'neutral · inverse',
        code: 'neutral → `tone="neutral"`; inverse removed (next phase: no consumer)',
      },
      { property: 'size', values: 'default · sm · xs', code: '`size` prop' },
      { property: 'label', values: 'text', code: 'children' },
      {
        property: 'status badge · tone',
        values: 'info · destructive · warning · success · neutral · agent',
        code: '`tone` (plus brand) with `variant="subtle"`; solid and outline exist for every tone',
      },
      { property: 'status badge · indicator', values: 'boolean', code: '`indicator` prop' },
      { property: 'status badge · rounded', values: 'off · on', code: '`shape` default · pill' },
      {
        property: 'status badge · show icon · icon',
        values: 'boolean · instance',
        code: 'an `<Icon>` child before the label',
      },
      { property: 'status badge · show count · count', values: 'boolean · text', code: '`count` prop' },
      { property: 'status badge · size', values: 'default · sm · xs', code: '`size` prop' },
    ],
    guide: {
      use: [
        'A static label for status, counts or metadata: connection state, unread count, version, provenance.',
        '`tone` picks the colour (neutral · brand · info · success · warning · destructive · agent); `variant` the weight: solid (`default`) for the strongest emphasis, `subtle` for status in lists and cards, `outline` for quiet metadata.',
        '`indicator` adds a dot, `count` a trailing number.',
        '`shape="pill"` for tags and provenance labels.',
      ],
      avoid: [
        'Anything people click or select: use Chip (filters, tags) or Button.',
        'Keyboard shortcuts: use Kbd. A message that needs a sentence: use Alert.',
      ],
      content: [
        'One or two words in sentence case; status as an adjective or past participle: “Connected”, “Failed”.',
        'Pick the tone from the meaning (success, warning, destructive), never for decoration.',
      ],
      a11y: [
        'Not interactive and not announced on change: pair a status that changes with a live region.',
        'The text carries the meaning; the tone color and the dot only repeat it.',
        'A bare number needs context: “3 unread”, not “3”.',
      ],
    },
    docs: {
      description: {
        component:
          'Compact label for counts, metadata and status (shadcn/ui Badge; Figma badge and status badge are one component in code). Two props set the look: `tone` neutral · brand · info · success · warning · destructive · agent, and `variant` default (solid) · subtle · outline — every tone has all three. `shape` default · pill, `size` default · sm · xs; `indicator` adds a dot in the tone, `count` a trailing number.',
      },
    },
  },
  args: { children: 'Label', variant: 'default', tone: 'neutral', size: 'default' },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    tone: { control: 'select', options: tones },
    shape: { control: 'inline-radio', options: ['default', 'pill'] },
    indicator: { control: 'boolean' },
    count: { control: 'text' },
    size: { control: 'inline-radio', options: sizes },
    children: { control: 'text' },
    asChild: { table: { disable: true } },
  },
  render: (args) => (
    <Row>
      <Badge {...args} />
    </Row>
  ),
})

/** Every prop is in Controls. */
export const Default = meta.story()

Default.test('renders a badge', async ({ canvas }) => {
  await expect(canvas.getByText('Label')).toHaveAttribute('data-slot', 'badge')
})

/** Every tone × treatment: solid (`default`), subtle, outline. */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col gap-1">
      {variants.map((variant) => (
        <Row key={variant}>
          <span className="w-16 type-text-xs-medium text-muted-foreground">{variant}</span>
          {tones.map((tone) => (
            <Badge key={tone} variant={variant} tone={tone}>
              {tone[0].toUpperCase() + tone.slice(1)}
            </Badge>
          ))}
        </Row>
      ))}
    </div>
  ),
})

Variants.test('every tone has all three treatments', async ({ canvasElement }) => {
  for (const variant of variants)
    await expect(canvasElement.querySelectorAll(`[data-slot=badge][data-variant=${variant}]`)).toHaveLength(
      tones.length,
    )
})

/** `shape` default and pill, in every treatment. */
export const Shapes = meta.story({
  render: () => (
    <div className="flex flex-col gap-1">
      {(['default', 'pill'] as const).map((shape) => (
        <Row key={shape}>
          {variants.map((variant) => (
            <Badge key={variant} variant={variant} tone="brand" shape={shape}>
              Label
            </Badge>
          ))}
        </Row>
      ))}
    </div>
  ),
})

/** 24 / 20 / 18 px with text sm / xs / 2xs medium. */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col gap-2">
      {variants.map((variant) => (
        <Row key={variant}>
          {sizes.map((size) => (
            <Badge key={size} variant={variant} size={size}>
              Label
            </Badge>
          ))}
        </Row>
      ))}
    </div>
  ),
})

export const WithIcons = meta.story({
  render: () => (
    <Row>
      <Badge>
        <Icon icon={SparklesIcon} />
        Label
      </Badge>
      <Badge variant="outline">
        <Icon icon={ClockIcon} />
        Label
      </Badge>
      <Badge variant="subtle">12</Badge>
    </Row>
  ),
})

/** A count next to a label, and asChild for linked tags (they get the focus ring). */
export const Composition = meta.story({
  render: () => (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center gap-2 type-text-sm-medium text-foreground">
        Label <Badge size="sm">24</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge asChild variant="outline">
          <a href="#tag">Label 1</a>
        </Badge>
        <Badge asChild variant="outline">
          <a href="#tag">Label 2</a>
        </Badge>
      </div>
    </div>
  ),
})

Composition.test('asChild renders a link styled as a badge', async ({ canvas }) => {
  await expect(canvas.getByRole('link', { name: 'Label 2' })).toHaveAttribute('data-slot', 'badge')
})

/** Figma status badge: `variant="subtle"` × `tone`, square and pill, with indicator, icon and count; the indicator also on solid and outline. */
export const Semantic = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_STATUS } },
  render: () => (
    <div className="flex flex-col gap-2">
      {(['default', 'pill'] as const).map((shape) => (
        <Row key={shape}>
          {tones.map((tone) => (
            <Badge key={tone} variant="subtle" tone={tone} shape={shape} indicator>
              Label
            </Badge>
          ))}
        </Row>
      ))}
      <Row>
        {variants.map((variant) => (
          <Badge key={variant} variant={variant} tone="success" indicator>
            Connected
          </Badge>
        ))}
      </Row>
      <Row>
        {sizes.map((size) => (
          <Badge key={size} variant="subtle" tone="agent" size={size} count={12}>
            <Icon icon={SparklesIcon} />
            Label
          </Badge>
        ))}
      </Row>
    </div>
  ),
})

Semantic.test('the indicator is decorative and the count is read', async ({ canvasElement }) => {
  const badge = canvasElement.querySelector('[data-slot=badge][data-tone=success]')!
  await expect(badge.querySelector('[data-slot=badge-indicator]')).toHaveAttribute('aria-hidden', 'true')
  await expect(canvasElement.querySelector('[data-slot=badge-count]')).toHaveTextContent('12')
})
