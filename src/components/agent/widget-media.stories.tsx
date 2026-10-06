import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { WidgetMedia } from './widget-media'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3268'
const FIGMA_AUDIO = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3468'

// A local placeholder image (no network): a soft gradient.
const IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c7d2fe"/><stop offset="1" stop-color="#e9d5ff"/></linearGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>',
  )

const meta = preview.meta({
  title: 'Agent Primitives/Widgets & Artifacts/Widget Media',
  tags: ['composite'],
  component: WidgetMedia,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'type',
        values: 'image · generated',
        code: '`kind` image (generated is Image Generation Card) · audio (Figma widget audio)',
      },
      { property: 'state', values: 'loading · ready · invalid', code: '`status` prop' },
      { property: 'title', values: 'text', code: '`title` prop' },
      { property: 'caption · show caption', values: 'text · boolean', code: '`meta` prop' },
      { property: 'show download', values: 'boolean', code: 'pass `onDownload` or not' },
      { property: 'show controls', values: 'boolean', code: 'the `<video controls>` you pass as children' },
      { property: 'widget audio · state', values: 'ready · playing · invalid', code: '`status` + `playing`' },
      {
        property: 'widget audio · duration · transcript',
        values: 'text',
        code: '`duration`, `transcript` props',
      },
    ],
    docs: {
      description: {
        component:
          'A file in an answer (`@/components/agent/widget-media`): `kind` image (a 16:9 preview, title, meta, Download) or audio (Play / Pause, waveform with `progress`, duration, transcript). `status` loading · ready · invalid. Composed from Card, Item, Empty, Button, Icon Tile and Voice Waveform. Generated images are Image Generation Card.',
      },
    },
  },
  args: {
    kind: 'image' as const,
    status: 'ready' as const,
    title: 'Title',
    meta: 'Subtitle',
    onDownload: fn(),
    children: <img src={IMAGE} alt="Subtitle" />,
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['image', 'audio'] },
    status: { control: 'inline-radio', options: ['loading', 'ready', 'invalid'] },
    title: { control: 'text' },
    meta: { control: 'text' },
    error: { control: 'text' },
    playing: { control: 'boolean' },
    progress: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    duration: { control: 'text' },
    transcript: { control: 'text' },
    onDownload: { control: false, table: { category: 'Events' } },
    onPlayToggle: { control: false, table: { category: 'Events' } },
    children: { control: false },
  },
})

/** Kind, status and text are in Controls. */
export const Default = meta.story({
  render: (args) => (
    <div className="w-90">
      <WidgetMedia {...args} />
    </div>
  ),
})

Default.test('downloads', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Download' }))
  await expect(args.onDownload).toHaveBeenCalledOnce()
})

/** Figma state: loading, ready, invalid. */
export const Statuses = meta.story({
  render: (args) => (
    <div className="grid w-240 grid-cols-3 gap-4">
      {(['loading', 'ready', 'invalid'] as const).map((status) => (
        <WidgetMedia key={status} {...args} status={status} />
      ))}
    </div>
  ),
})

Statuses.test('loading is busy; invalid says so', async ({ canvas, canvasElement }) => {
  await expect(canvasElement.querySelector('[data-status=loading]')).toHaveAttribute('aria-busy', 'true')
  await expect(canvas.getByText('Couldn’t load media')).toBeVisible()
})

function AudioDemo() {
  const [playing, setPlaying] = useState(false)
  return (
    <WidgetMedia
      kind="audio"
      title="Title"
      playing={playing}
      progress={playing ? 0.36 : 0}
      duration={playing ? '0:48 / 2:14' : '2:14'}
      onPlayToggle={() => setPlaying((p) => !p)}
      transcript="Subtitle"
    />
  )
}

/** Figma widget audio: ready, playing (Play toggles), invalid. */
export const Audio = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_AUDIO } },
  render: () => (
    <div className="flex w-120 flex-col gap-4">
      <AudioDemo />
      <WidgetMedia kind="audio" status="invalid" title="Title" duration="2:14" error="Subtitle" />
    </div>
  ),
})

Audio.test('play toggles to pause', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Play' }))
  await expect(canvas.getByRole('button', { name: 'Pause' })).toHaveAttribute('aria-pressed', 'true')
  await expect(canvas.getByText('0:48 / 2:14')).toBeVisible()
})
