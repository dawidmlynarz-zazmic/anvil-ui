import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { MapView, type MapPinData } from './map-view'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10773-2906'

const PINS: MapPinData[] = [
  { id: 'a', x: 22, y: 34, label: '$29' },
  { id: 'b', x: 50, y: 62, label: '$39' },
  { id: 'c', x: 78, y: 42, label: '$24' },
  { id: 'd', x: 86, y: 80, label: '12', kind: 'cluster' },
]
const STOPS: MapPinData[] = [
  { id: 's1', x: 24, y: 70, label: 'Hotel', kind: 'stop' },
  { id: 's2', x: 46, y: 36, label: 'Museum', kind: 'stop' },
  { id: 's3', x: 74, y: 52, label: 'Dinner', kind: 'stop' },
]

const meta = preview.meta({
  title: 'Agent Builder/Catalog & scheduling/Map View',
  tags: ['agent-builder'],
  component: MapView,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'loaded · loading · empty · offline', code: '`status` prop' },
      {
        property: 'pins (price · selected · cluster)',
        values: 'map pin',
        code: '`pins` (`kind` price · cluster · stop) + `selected`',
      },
      { property: 'route', values: 'boolean', code: '`route` (points) or not' },
      {
        property: 'preview card',
        values: 'card',
        code: '`preview` (thumbnail, title, details, price, action)',
      },
    ],
    guide: {
      use: [
        'Places the assistant found, on a map: venues, stores, the stops of a day. Pair with Location List so the user can also read them.',
        'Pass your map as `children` (Mapbox, Google, Leaflet); `pins` sit over it as buttons, and `selected` shows a `preview` card.',
        '`route` draws the line between stops; use `kind="stop"` pins for those.',
      ],
      avoid: [
        'A decorative map with nothing to select: use an image.',
        'Many hundreds of pins: cluster them (`kind="cluster"`) and zoom on click.',
        'Turn-by-turn navigation: link out to a maps app.',
      ],
      content: [
        'A price pin shows what the user pays (“$39”); a stop pin is named for the place (“Museum”).',
        'Empty copy says what is missing (“None of these places have an address yet”) and offers “Show as list”.',
        'Offline copy says what still works (“Addresses and directions still work in the list”).',
      ],
      a11y: [
        'Every pin is a button named by its label (a cluster “12 places”); the selected one has `aria-pressed`. A map alone is not accessible, so always offer the list (Show as list).',
        'Zoom and “Show my location” are labelled buttons; loading is a status region.',
      ],
    },
    docs: {
      description: {
        component:
          'The frame around a map (`@/components/agent/map-view`): pins (price, cluster, stop), an optional route, zoom and locate controls and a preview card for the selected place. Anvil ships no map: pass yours as `children`, or see the static placeholder Storybook draws. `status` loaded · loading · empty · offline. Built on Card, Button, Skeleton and Empty State.',
      },
    },
  },
  args: {
    pins: PINS,
    selected: 'b',
    status: 'loaded' as const,
    emptyDescription: 'None of these places have an address yet.',
    offlineDescription: 'Addresses and directions still work in the list.',
    preview: {
      title: 'Lyric Hall',
      meta: '0.8 mi · open until 22:00',
      price: 'From $39',
      actionLabel: 'View',
      onAction: fn(),
    },
    onSelectPin: fn(),
    onZoomIn: fn(),
    onZoomOut: fn(),
    onLocate: fn(),
    onShowList: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['loaded', 'loading', 'empty', 'offline'] },
    selected: { control: 'text' },
    emptyTitle: { control: 'text' },
    emptyDescription: { control: 'text' },
    offlineTitle: { control: 'text' },
    offlineDescription: { control: 'text' },
    listLabel: { control: 'text' },
    pins: { control: false },
    route: { control: false },
    preview: { control: false },
    onSelectPin: { control: false, table: { category: 'Events' } },
    onZoomIn: { control: false, table: { category: 'Events' } },
    onZoomOut: { control: false, table: { category: 'Events' } },
    onLocate: { control: false, table: { category: 'Events' } },
    onShowList: { control: false, table: { category: 'Events' } },
  },
  decorators: [
    (Story) => (
      <div className="w-145 max-w-full">
        <Story />
      </div>
    ),
  ],
})

/** Loaded with price pins, a cluster and a selected place; other states are in Controls. */
export const Default = meta.story()

Default.test('pins select, the selected one is marked, controls act', async ({ canvas, args }) => {
  await expect(canvas.getByRole('button', { name: '$39', pressed: true })).toBeVisible()
  await expect(canvas.getByRole('button', { name: '12 places' })).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: '$29' }))
  await expect(args.onSelectPin).toHaveBeenCalledWith('a')
  await userEvent.click(canvas.getByRole('button', { name: 'Zoom in' }))
  await expect(args.onZoomIn).toHaveBeenCalledOnce()
})

/** A route between stops: stop pins and the line, with the day’s summary as the preview. */
export const Route = meta.story({
  args: {
    pins: STOPS,
    selected: undefined,
    route: [
      { x: 24, y: 70 },
      { x: 24, y: 36 },
      { x: 46, y: 36 },
      { x: 46, y: 52 },
      { x: 74, y: 52 },
    ],
    preview: {
      title: 'Day 1 · 3 stops',
      meta: '2.4 km · 32 min walking',
      price: 'Hotel → Museum → Dinner',
      actionLabel: 'Start',
    },
  },
})

/** Figma state: loading · empty · offline. */
export const States = meta.story({
  decorators: [],
  render: (args) => (
    <div className="flex w-145 max-w-full flex-col gap-6">
      <MapView {...args} status="loading" />
      <MapView {...args} status="empty" />
      <MapView {...args} status="offline" />
    </div>
  ),
})

States.test('each state says what is happening and offers the list', async ({ canvas, args }) => {
  await expect(canvas.getByRole('status', { name: 'Loading map' })).toBeVisible()
  await expect(canvas.getByText('Nothing to show on the map')).toBeVisible()
  await expect(canvas.getByText('Map unavailable offline')).toBeVisible()
  await userEvent.click(canvas.getAllByRole('button', { name: 'Show as list' })[0])
  await expect(args.onShowList).toHaveBeenCalledOnce()
})
