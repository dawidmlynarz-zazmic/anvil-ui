import preview from '#.storybook/preview'
import { expect, waitFor } from 'storybook/test'

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from './avatar'
import { BotIcon, Icon, SparklesIcon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=1588-22579'
const FIGMA_GROUP = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=2626-5210'

// A local placeholder photo (no network in stories or tests).
const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ed1b3"/><stop offset="1" stop-color="#0a7133"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><circle cx="48" cy="38" r="16" fill="#e6f9ee"/><rect x="20" y="60" width="56" height="40" rx="20" fill="#e6f9ee"/></svg>',
  )

const sizes = ['xs', 'sm', 'default', 'lg'] as const
const shapes = ['circle', 'square'] as const

type DemoProps = {
  size?: (typeof sizes)[number]
  shape?: (typeof shapes)[number]
  /** Figma `type` (content kind, not a prop): img · text · icon · brand. */
  type?: 'img' | 'text' | 'icon' | 'brand'
  label?: string
}

function DemoAvatar({ size = 'default', shape = 'circle', type = 'text', label = 'LB' }: DemoProps) {
  return (
    <Avatar size={size} shape={shape}>
      {type === 'img' && <AvatarImage src={PHOTO} alt="Label" />}
      {type === 'text' && <AvatarFallback>{label}</AvatarFallback>}
      {type === 'icon' && (
        <AvatarFallback tone="agent">
          <Icon icon={BotIcon} label="Label" />
        </AvatarFallback>
      )}
      {type === 'brand' && (
        <AvatarFallback tone="neutral">
          <Icon icon={SparklesIcon} label="Label" />
        </AvatarFallback>
      )}
    </Avatar>
  )
}

const meta = preview.meta({
  title: 'Components/Avatar',
  tags: ['ui-component'],
  component: DemoAvatar,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'avatar · size', values: 'lg · default · sm · xs', code: '`size` prop' },
      { property: 'avatar · round', values: 'off · on', code: '`shape` prop (square · circle)' },
      {
        property: 'avatar · type',
        values: 'img · text · icon · brand',
        code: '`AvatarImage` / `AvatarFallback` (initials) / `AvatarFallback tone="agent"` (icon) / `AvatarFallback tone="neutral"` (brand)',
      },
      { property: 'avatar · label', values: 'text', code: '`AvatarFallback` children' },
      {
        property: 'avatar group · size',
        values: 'xs · sm · default',
        code: '`size` prop on each `Avatar` in `AvatarGroup`',
      },
    ],
    docs: {
      description: {
        component:
          'A person, agent or brand (shadcn/ui Avatar on Radix): `size` xs · sm · default · lg (24 / 32 / 40 / 48), `shape` circle · square. Content: `AvatarImage` (with `AvatarFallback` while it loads or if it fails), or a fallback with initials (tone warning), an icon (tone agent) or a brand mark (tone neutral). `AvatarGroup` stacks avatars; `AvatarGroupCount` shows the overflow.',
      },
    },
  },
  args: { size: 'default', shape: 'circle', type: 'text', label: 'LB' },
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
    shape: { control: 'inline-radio', options: shapes },
    type: { control: 'inline-radio', options: ['img', 'text', 'icon', 'brand'] },
    label: { control: 'text' },
  },
})

export const Default = meta.story()

Default.test('shows the initials', async ({ canvas }) => {
  await expect(canvas.getByText('LB')).toBeVisible()
})

/** Figma type × size × round (reference). */
export const Types = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {shapes.map((shape) =>
        (['img', 'text', 'icon', 'brand'] as const).map((type) => (
          <div key={shape + type} className="flex items-center gap-4">
            <span className="w-28 type-text-xs-medium text-muted-foreground">
              {type} · {shape}
            </span>
            {[...sizes].reverse().map((size) => (
              <DemoAvatar key={size} size={size} shape={shape} type={type} />
            ))}
          </div>
        )),
      )}
    </div>
  ),
})

Types.test('images load and are named', async ({ canvas }) => {
  await waitFor(() => expect(canvas.getAllByRole('img', { name: 'Label' }).length).toBeGreaterThan(8))
})

/** A broken image falls back to the initials. */
export const Fallback = meta.story({
  render: () => (
    <Avatar>
      <AvatarImage src="data:image/png;base64,broken" alt="Label" />
      <AvatarFallback>LB</AvatarFallback>
    </Avatar>
  ),
})

Fallback.test('the fallback shows when the image fails', async ({ canvas }) => {
  await waitFor(() => expect(canvas.getByText('LB')).toBeVisible())
})

/** Figma avatar group with the .more-indicator, at every size. */
export const Group = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_GROUP } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(['xs', 'sm', 'default', 'lg'] as const).map((size) => (
        <AvatarGroup key={size}>
          <DemoAvatar size={size} type="img" />
          <DemoAvatar size={size} type="text" />
          <DemoAvatar size={size} type="img" />
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
      ))}
    </div>
  ),
})

/** shadcn AvatarBadge: a status dot. */
export const WithBadge = meta.story({
  render: () => (
    <div className="flex items-center gap-4">
      {sizes.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>LB</AvatarFallback>
          <AvatarBadge className="bg-success" />
        </Avatar>
      ))}
    </div>
  ),
})
