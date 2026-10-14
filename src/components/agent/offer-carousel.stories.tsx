import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Badge } from '@/components/ui/badge'

import { OfferCard } from './offer-card'
import { OfferCarousel } from './offer-carousel'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-15838'

const SHOWS = [
  {
    title: 'Paper Kingdoms',
    badge: 'Musical',
    tone: 'info',
    subtitle: 'Lyric Hall · Manchester',
    price: 'From $29',
  },
  {
    title: 'The Lantern Keeper',
    badge: 'Family',
    tone: 'success',
    subtitle: 'Grand Royal · Glasgow',
    price: 'From $24',
  },
  {
    title: 'Northern Lights',
    badge: 'New',
    tone: 'info',
    subtitle: 'Empire Arts · Liverpool',
    price: 'From $35',
  },
  {
    title: 'Salt and Sparrow',
    badge: 'Drama',
    tone: 'warning',
    subtitle: 'The Crescent · Leeds',
    price: 'From $31',
  },
] as const

const offers = SHOWS.map((show) => (
  <OfferCard
    key={show.title}
    title={show.title}
    badge={
      <Badge variant="subtle" tone={show.tone} size="sm">
        {show.badge}
      </Badge>
    }
    subtitle={show.subtitle}
    meta="3 Oct – 15 Nov 2026"
    rating={{ value: 4.8, label: '4.8 · 2.3k reviews' }}
    price={show.price}
    ctaLabel="View dates"
    onSelect={() => {}}
  />
))

const meta = preview.meta({
  title: 'Agent Builder/Catalog & scheduling/Offer Carousel',
  tags: ['agent-builder'],
  component: OfferCarousel,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'loaded · loading · empty',
        code: '`status` prop (plus `error`, which Figma draws as a fourth card)',
      },
      { property: 'title · count', values: 'text', code: '`title` · `count`' },
      { property: 'see all', values: 'text', code: '`seeAllLabel` + `onSeeAll`' },
    ],
    guide: {
      use: [
        'A short set of offers the assistant recommends (“Recommended for you”), scrolled sideways inside the chat.',
        'Pass vertical Offer Cards as children; each becomes a slide. Say how many there are (`count`) and offer “See all”.',
        'Let `status` carry loading, empty and error so the header stays put while results change.',
      ],
      avoid: [
        'More than about twelve slides: use “See all” to a list or a map.',
        'Two or three options to compare: use Comparison Table.',
        'Pictures of one item: use Media Gallery.',
      ],
      content: [
        '`title` says why these (“Recommended for you”); `count` is the total (“12 results”), not the number visible.',
        'Empty copy names the cause (“No shows match these filters”) and, in `emptyDescription`, what to change.',
        'Error copy says what failed and what is safe (“Nothing was reserved”).',
      ],
      a11y: [
        'The carousel is a region with slides; Previous and Next are labelled buttons that disable at the ends, and the dots are buttons too.',
        'Loading is a status region named “Loading results”; empty and error are announced.',
      ],
    },
    docs: {
      description: {
        component:
          'A scrolling set of offers (`@/components/agent/offer-carousel`): a header with `title`, `count` and Previous / Next, the slides (your Offer Cards), dots and “See all”. `status` loaded · loading · empty · error. Built on Card, Carousel, Offer Card, Button, Skeleton and Empty State.',
      },
    },
  },
  args: {
    title: 'Recommended for you',
    count: '12 results',
    status: 'loaded' as const,
    seeAllLabel: 'See all 12',
    emptyTitle: 'No shows match these filters',
    emptyDescription: 'Try another date or a wider area.',
    errorTitle: 'Couldn’t load results',
    errorDescription: 'The search didn’t respond. Nothing was reserved.',
    onSeeAll: fn(),
    onRetry: fn(),
    onHelp: fn(),
    children: offers,
  },
  argTypes: {
    title: { control: 'text' },
    count: { control: 'text' },
    status: { control: 'inline-radio', options: ['loaded', 'loading', 'empty', 'error'] },
    seeAllLabel: { control: 'text' },
    emptyTitle: { control: 'text' },
    emptyDescription: { control: 'text' },
    errorTitle: { control: 'text' },
    errorDescription: { control: 'text' },
    children: { control: false },
    onSeeAll: { control: false, table: { category: 'Events' } },
    onRetry: { control: false, table: { category: 'Events' } },
    onHelp: { control: false, table: { category: 'Events' } },
  },
  decorators: [
    (Story) => (
      <div className="w-160 max-w-full">
        <Story />
      </div>
    ),
  ],
})

/** Loaded; loading, empty and error are in Controls. */
export const Default = meta.story()

Default.test('shows the slides, the count and See all', async ({ canvas, canvasElement, args }) => {
  await expect(canvasElement.querySelector('[aria-roledescription=carousel]')).toBeVisible()
  await expect(canvas.getByText('12 results')).toBeVisible()
  await expect(canvasElement.querySelectorAll('[aria-roledescription=slide]')).toHaveLength(4)
  await userEvent.click(canvas.getByRole('button', { name: 'See all 12' }))
  await expect(args.onSeeAll).toHaveBeenCalledOnce()
})

/** Figma state: loaded · loading · empty, and the error card. */
export const States = meta.story({
  render: (args) => (
    <div className="flex w-160 max-w-full flex-col gap-6">
      <OfferCarousel {...args} title="Recommended for you" status="loading" />
      <OfferCarousel {...args} title="Family shows" status="empty" />
      <OfferCarousel {...args} title="Last minute" status="error" />
    </div>
  ),
})

States.test('each state says what is happening', async ({ canvas, args }) => {
  await expect(canvas.getByRole('status', { name: 'Loading results' })).toBeVisible()
  await expect(canvas.getByText('No shows match these filters')).toBeVisible()
  await expect(canvas.getByRole('alert')).toHaveTextContent('Couldn’t load results')
  await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
  await expect(args.onRetry).toHaveBeenCalledOnce()
})
