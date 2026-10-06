import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { MessageAction } from '@/components/agent/message-actions'
import { Button } from '@/components/ui/button'
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  Icon,
  LayersIcon,
  PencilIcon,
  RotateCcwIcon,
} from '@/components/ui/icon'

import { ImageGenerationCard, type GenerationStatus } from './image-generation-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10732-2829'

const swatch = (a: string, b: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>`,
  )
const IMAGES = [
  swatch('#c7d2fe', '#e9d5ff'),
  swatch('#bae6fd', '#c7d2fe'),
  swatch('#fde68a', '#fbcfe8'),
  swatch('#bbf7d0', '#bae6fd'),
]

const actions = (
  <>
    {[
      [DownloadIcon, 'Download'],
      [PencilIcon, 'Edit'],
      [RotateCcwIcon, 'Regenerate'],
      [CopyIcon, 'Copy'],
    ].map(([icon, label]) => (
      <MessageAction key={label as string} label={label as string} size="icon-xs">
        <Icon icon={icon as typeof DownloadIcon} />
      </MessageAction>
    ))}
  </>
)

type DemoProps = {
  status?: GenerationStatus
  prompt?: string
  onCancel?: () => void
  onUse?: (v: string) => void
}

function Demo({ status = 'ready', prompt = 'Subtitle', onCancel, onUse }: DemoProps) {
  const [selected, setSelected] = useState('1')
  return (
    <ImageGenerationCard
      status={status}
      prompt={prompt}
      statusText="Generating · 8s"
      onCancel={onCancel}
      actions={actions}
      primaryAction={
        status === 'variations' ? (
          <Button size="xs" intent="brand" onClick={() => onUse?.(selected)}>
            <Icon icon={CheckIcon} />
            Use selected
          </Button>
        ) : (
          <Button size="xs" variant="outline" intent="neutral">
            <Icon icon={LayersIcon} />
            Variations
          </Button>
        )
      }
      variations={IMAGES.map((src, i) => ({
        value: String(i + 1),
        label: `Label ${i + 1}`,
        image: <img src={src} alt="" />,
      }))}
      selected={selected}
      onSelectedChange={setSelected}
    >
      <img src={IMAGES[0]} alt="Subtitle" />
    </ImageGenerationCard>
  )
}

const meta = preview.meta({
  title: 'Agent Blocks/Widgets & Artifacts/Image Generation Card',
  tags: ['feature'],
  component: Demo,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'generating · ready · variations', code: '`status` prop' },
      { property: 'prompt (part / meta item)', values: 'text', code: '`prompt` prop' },
      {
        property: 'download · edit · regenerate · copy',
        values: 'instance',
        code: '`actions`: MessageAction items (icon-xs) in Message Actions',
      },
      { property: 'primary action', values: 'instance', code: '`primaryAction` (Variations · Use selected)' },
      { property: 'variation 1–4', values: 'frame', code: '`variations` in a single-choice Toggle Group' },
    ],
    docs: {
      description: {
        component:
          'An image the agent generates (`@/components/agent/image-generation-card`), composed from Card, Empty (generating), Message Actions (download, edit, regenerate, copy), Toggle Group (pick a variation) and Button. `status` generating · ready · variations, `prompt`, `statusText`, `note`, `onCancel`, `actions`, `primaryAction`, `variations`, `selected`, `onSelectedChange`; the image as children. Figma widget media type=generated is this card.',
      },
    },
  },
  args: { status: 'ready' as const, prompt: 'Subtitle', onCancel: fn(), onUse: fn() },
  argTypes: {
    status: { control: 'inline-radio', options: ['generating', 'ready', 'variations'] },
    prompt: { control: 'text' },
    onCancel: { control: false, table: { category: 'Events' } },
    onUse: { control: false, table: { category: 'Events' } },
  },
})

/** Status and prompt are in Controls. */
export const Default = meta.story({
  render: (args) => (
    <div className="w-120">
      <Demo {...args} />
    </div>
  ),
})

Default.test('the actions are named and one toolbar', async ({ canvas }) => {
  await expect(canvas.getByRole('toolbar', { name: 'Message actions' })).toBeVisible()
  await expect(canvas.getByRole('button', { name: 'Download' })).toBeVisible()
})

/** Figma states: generating, ready, variations. */
export const Statuses = meta.story({
  render: (args) => (
    <div className="grid w-300 grid-cols-3 gap-4">
      {(['generating', 'ready', 'variations'] as const).map((status) => (
        <Demo key={status} {...args} status={status} />
      ))}
    </div>
  ),
})

/** Variations: pick one, then Use selected. */
export const Variations = meta.story({
  args: { status: 'variations' },
  render: (args) => (
    <div className="w-120">
      <Demo {...args} />
    </div>
  ),
})

Variations.test('picking a variation and using it', async ({ canvas, args }) => {
  const second = canvas.getByRole('radio', { name: 'Label 2' })
  await userEvent.click(second)
  await expect(second).toHaveAttribute('aria-checked', 'true')
  await userEvent.click(canvas.getByRole('button', { name: 'Use selected' }))
  await expect(args.onUse).toHaveBeenCalledWith('2')
})
