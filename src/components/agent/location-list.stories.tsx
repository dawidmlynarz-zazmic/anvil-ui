import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { LocationItem, LocationList } from './location-list'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-16073'

const PLACES = [
  {
    id: 'leeds',
    month: 'SEP',
    dates: '22–27',
    name: 'Leeds',
    place: 'The Crescent',
    availability: 'limited',
    distance: '41 mi',
  },
  {
    id: 'manchester',
    month: 'OCT',
    dates: '3–15',
    name: 'Manchester',
    place: 'Lyric Hall',
    availability: 'good',
    distance: '2 mi',
  },
  {
    id: 'liverpool',
    month: 'OCT',
    dates: '20–25',
    name: 'Liverpool',
    place: 'Empire Arts',
    availability: 'good',
    distance: '34 mi',
  },
  {
    id: 'birmingham',
    month: 'NOV',
    dates: '3–8',
    name: 'Birmingham',
    place: 'Alexandra Stage',
    availability: 'sold-out',
    distance: '86 mi',
  },
  {
    id: 'glasgow',
    month: 'NOV',
    dates: '17–29',
    name: 'Glasgow',
    place: 'Grand Royal',
    availability: 'good',
    distance: '214 mi',
  },
] as const

function Places({ selected, onSelect }: { selected?: string; onSelect?: (id: string) => void }) {
  return (
    <>
      {PLACES.map(({ id, ...place }) => (
        <LocationItem key={id} {...place} selected={selected === id} onClick={() => onSelect?.(id)} />
      ))}
    </>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Catalog & scheduling/Location List',
  tags: ['agent-builder'],
  component: LocationList,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state (location item)',
        values: 'default · selected · unavailable · hover · focus',
        code: '`selected` prop · `availability="sold-out"` · `hover:` / `focus-visible:` selectors',
      },
      {
        property: 'state (location list)',
        values: 'loaded · loading',
        code: '`status` prop (plus `empty` and `permission`, drawn as separate cards)',
      },
      {
        property: 'date block · place · availability · distance',
        values: 'text',
        code: '`LocationItem` `month` · `dates` · `name` · `place` · `availability` · `distance`',
      },
    ],
    guide: {
      use: [
        'Places the user can choose between, each with its own dates and how close it is: venues, clinics, branches, pickup points.',
        '`LocationItem` rows go in the list as children; select one to carry on (to the date picker, or to the map).',
        'Offer “Near me” when sorting by distance is possible; say so plainly when location access is off.',
      ],
      avoid: [
        'Showing places on a map: use Map View (pair the two).',
        'A long list of plain links: use Item.',
        'Choosing between full offers: use Offer Card.',
      ],
      content: [
        'Name is the city or place; the line under it is the venue. Dates are a short range (“3–15”) with the month above.',
        'Availability is a word, not only a colour: Good availability · Limited · Sold out.',
        'Empty copy says how far the nearest is and what to change (“Widen the area”).',
      ],
      a11y: [
        'Each row is a button; the selected one has `aria-pressed`. Availability is text, so it is never colour alone.',
        'The list is a labelled section; loading is a status region; empty and permission are announced.',
      ],
    },
    docs: {
      description: {
        component:
          'A list of places (`@/components/agent/location-list`): `LocationList` (title, subtitle, a “Near me” button, rows as children; `status` loaded · loading · empty · permission) and `LocationItem` (a selectable row with a date block, name, place, availability Badge, distance and chevron). Built on Card, Item, Badge, Marker, Button, Skeleton and Empty State.',
      },
    },
  },
  args: {
    title: 'Locations near you',
    subtitle: '14 locations · Sep 2026 – Mar 2027',
    status: 'loaded' as const,
    emptyDescription: 'The nearest is 48 mi away. Widen the area or search another city.',
    emptyActionLabel: 'Widen the area',
    permissionDescription: 'Turn on location to sort by distance, or type a city.',
    onNearMe: fn(),
    onEmptyAction: fn(),
    onPermissionAction: fn(),
    children: <Places selected="manchester" />,
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    status: { control: 'inline-radio', options: ['loaded', 'loading', 'empty', 'permission'] },
    emptyTitle: { control: 'text' },
    emptyDescription: { control: 'text' },
    emptyActionLabel: { control: 'text' },
    permissionTitle: { control: 'text' },
    permissionDescription: { control: 'text' },
    permissionActionLabel: { control: 'text' },
    children: { control: false },
    onNearMe: { control: false, table: { category: 'Events' } },
    onEmptyAction: { control: false, table: { category: 'Events' } },
    onPermissionAction: { control: false, table: { category: 'Events' } },
  },
  decorators: [
    (Story) => (
      <div className="w-160 max-w-full">
        <Story />
      </div>
    ),
  ],
})

/** Loaded; loading, empty and permission are in Controls. */
export const Default = meta.story()

Default.test('marks the selected place and says availability in words', async ({ canvas, args }) => {
  await expect(canvas.getByRole('button', { name: /Manchester/, pressed: true })).toBeVisible()
  await expect(canvas.getAllByText('Good availability')).toHaveLength(3)
  await expect(canvas.getByText('Sold out')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Near me' }))
  await expect(args.onNearMe).toHaveBeenCalledOnce()
})

function Interactive() {
  const [selected, setSelected] = useState<string>()
  return (
    <LocationList title="Locations near you" subtitle="14 locations · Sep 2026 – Mar 2027">
      <Places selected={selected} onSelect={setSelected} />
    </LocationList>
  )
}

/** Choosing a row. */
export const Choosing = meta.story({
  decorators: [],
  render: () => (
    <div className="w-160 max-w-full">
      <Interactive />
    </div>
  ),
})

Choosing.test('selecting a row selects only that row', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: /Liverpool/ }))
  await expect(canvas.getByRole('button', { name: /Liverpool/, pressed: true })).toBeVisible()
  await expect(canvas.getAllByRole('button', { pressed: true })).toHaveLength(1)
})

/** The other Figma states: loading, empty, and location access off. */
export const States = meta.story({
  decorators: [],
  render: (args) => (
    <div className="flex w-160 max-w-full flex-col gap-6">
      <LocationList {...args} title="Loading" status="loading" />
      <LocationList {...args} title="Empty" status="empty" />
      <LocationList {...args} title="Permission" status="permission" />
    </div>
  ),
})
