import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { MediaGallery } from './media-gallery'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10773-3061'

const PHOTOS = [
  { alt: 'The stage before the curtain rises' },
  { alt: 'The cast in the second act' },
  { alt: 'The lobby at dusk' },
  { alt: 'Costumes in the workshop' },
  { alt: 'The view from the circle' },
  { alt: 'The foyer bar' },
]

const meta = preview.meta({
  title: 'Agent Builder/Catalog & scheduling/Media Gallery',
  tags: ['agent-builder'],
  component: MediaGallery,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '420px' },
      description: {
        component:
          'Photos of one item (`@/components/agent/media-gallery`): `layout` grid (a hero, four tiles and a “+N photos” overlay) or carousel (one large photo, counter, arrows, dots); either opens a dark lightbox Dialog with the title and position, Download, Close, the photo and thumbnails. `status` loaded · loading · empty · error. Built on Carousel, Dialog, Badge, Button, Skeleton and Empty State.',
      },
    },
    figmaProps: [
      {
        property: 'layout',
        values: 'grid · carousel · lightbox',
        code: '`layout` grid · carousel; the lightbox is the dialog both open (`open`)',
      },
      { property: 'state', values: 'loaded · loading · empty', code: '`status` prop (plus `error`)' },
    ],
    guide: {
      use: [
        'Photos or video of one offer: a grid on a detail page, a carousel inside a chat bubble, a lightbox to look closely.',
        'Pass `total` when only the first photos are loaded, so “+12 photos” and “2 of 16” are right.',
        'Give every photo an `alt` that says what it shows; it names the button that opens it.',
      ],
      avoid: [
        'A set of different offers: use Offer Carousel.',
        'A single decorative image: use an `<img>` in the card.',
        'Video playback controls: the lightbox shows stills; link out for video.',
      ],
      content: [
        'The lightbox title is the item’s name; the counter says where you are (“2 of 16”).',
        'Empty copy says why and what to do (“This item doesn’t have photos. Reviews may include some.”).',
      ],
      a11y: [
        'Every photo is a button named “Open photo 3: alt”; the lightbox is a modal Dialog titled with the item and position, ← / → move between photos and Escape closes it.',
        'Loading is a status region; the counter and dots are announced with the carousel.',
      ],
    },
  },
  args: {
    items: PHOTOS,
    total: 16,
    layout: 'grid' as const,
    status: 'loaded' as const,
    title: 'Paper Kingdoms',
    emptyDescription: 'This show doesn’t have photos. Reviews may include some.',
    emptyActionLabel: 'See reviews',
    errorDescription: 'Images didn’t load. Details are unaffected.',
    onDownload: fn(),
    onRetry: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    layout: { control: 'inline-radio', options: ['grid', 'carousel'] },
    status: { control: 'inline-radio', options: ['loaded', 'loading', 'empty', 'error'] },
    title: { control: 'text' },
    total: { control: 'number' },
    open: { control: 'boolean' },
    emptyDescription: { control: 'text' },
    emptyActionLabel: { control: 'text' },
    errorDescription: { control: 'text' },
    items: { control: false },
    onDownload: { control: false, table: { category: 'Events' } },
    onRetry: { control: false, table: { category: 'Events' } },
    onOpenChange: { control: false, table: { category: 'Events' } },
  },
  decorators: [
    (Story) => (
      <div className="w-145 max-w-full">
        <Story />
      </div>
    ),
  ],
})

/** Grid or carousel is in Controls; the lightbox opens from either. */
export const Default = meta.story()

Default.test(
  'opens the lightbox, moves with the arrow keys and closes',
  async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Open photo 3/ }))
    const body = within(canvasElement.ownerDocument.body)
    const dialog = await body.findByRole('dialog', { name: /Paper Kingdoms · 3 of 16/ })
    await waitFor(() => expect(dialog).toBeVisible())
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(body.getByRole('dialog', { name: /4 of 16/ })).toBeVisible())
    await userEvent.click(body.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  },
)

/** One large photo with the counter, arrows and dots. */
export const Carousel = meta.story({ args: { layout: 'carousel' } })

/** The lightbox open on a photo, with Download. */
export const Lightbox = meta.story({
  args: { defaultOpen: true, defaultIndex: 1 },
  parameters: { docs: { story: { inline: false, height: '560px' } } },
})

/** Figma state: loading · empty, and error. */
export const States = meta.story({
  render: (args) => (
    <div className="flex flex-col gap-6">
      <MediaGallery {...args} status="loading" />
      <MediaGallery {...args} status="empty" />
      <MediaGallery {...args} status="error" />
    </div>
  ),
})

States.test('each state says what is happening', async ({ canvas, args }) => {
  await expect(canvas.getByRole('status', { name: 'Loading photos' })).toBeVisible()
  await expect(canvas.getByText('No photos yet')).toBeVisible()
  await expect(canvas.getByRole('alert')).toHaveTextContent('Couldn’t load photos')
  await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
  await expect(args.onRetry).toHaveBeenCalledOnce()
})
