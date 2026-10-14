import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Badge } from '@/components/ui/badge'

import { OfferCard } from './offer-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-15706'

const musical = (
  <Badge variant="subtle" tone="info" size="sm">
    Musical
  </Badge>
)

const SHOW = {
  subtitle: 'Lyric Hall · Manchester',
  meta: '3 Oct – 15 Nov 2026',
  rating: { value: 4.8, label: '4.8 · 2.3k reviews' },
  price: 'From $29',
  ctaLabel: 'View dates',
}

const meta = preview.meta({
  title: 'Agent Builder/Catalog & scheduling/Offer Card',
  tags: ['agent-builder'],
  component: OfferCard,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'layout', values: 'vertical · horizontal · compact', code: '`layout` prop' },
      {
        property: 'state',
        values: 'default · hover · selected · unavailable · focus',
        code: 'hover: / has-focus-visible: selectors · `selected` prop · `unavailable` prop',
      },
      { property: 'show badge', values: 'boolean', code: 'pass `badge` or not' },
      { property: 'show rating', values: 'boolean', code: 'pass `rating` or not' },
      { property: 'show cta', values: 'boolean', code: 'pass `ctaLabel` or not' },
      {
        property: 'title · subtitle · meta · price',
        values: 'text',
        code: '`title` · `subtitle` · `meta` · `price`',
      },
    ],
    guide: {
      use: [
        'One thing the user can book or buy, in a result list or a carousel: an event, a stay, a product, a provider.',
        'Vertical in a carousel or grid, horizontal in a list, compact when the user is picking among few rows.',
        'Pass `onSelect` or `href` when the whole card opens the item; the button is the quick action (View dates).',
      ],
      avoid: [
        'The full page of one item (rating, facts, description, actions): use Item Detail.',
        'Comparing two or three options row by row: use Comparison Table.',
        'A plain row in a settings list: use Item.',
      ],
      content: [
        '`title` is the thing’s name; `subtitle` says where or who; `meta` carries the dates or one key detail.',
        '`price` leads with what the user pays (“From $29”); when it is gone, `unavailable` shows “Sold out” and offers alternatives.',
        'The button says what happens next (“View dates”, “Book”), not “Click here”.',
      ],
      a11y: [
        'A selectable card has one tab stop: the title is the link or button and stretches over the card; the quick-action button stays separate, so nothing interactive is nested.',
        'Selected is shown by the stroke and announced (`aria-pressed` on the button form, `aria-current` on the link).',
        'The rating reads once (“Rated 4.8 out of 5, 4.8 · 2.3k reviews”); a sold-out card says so in text.',
      ],
    },
    docs: {
      description: {
        component:
          'An offer the user can book or buy (`@/components/agent/offer-card`): media, `badge`, `title`, `subtitle`, `meta`, `rating`, `price` and a button. `layout` vertical · horizontal · compact; `selected` and `unavailable` draw the Figma states; `onSelect` / `href` make the whole card selectable. Built on Card, Rating Display and Button.',
      },
    },
  },
  args: {
    layout: 'vertical' as const,
    title: 'Paper Kingdoms',
    ...SHOW,
    badge: musical,
    selected: false,
    unavailable: false,
    onCta: fn(),
    onSelect: fn(),
  },
  argTypes: {
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal', 'compact'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    meta: { control: 'text' },
    price: { control: 'text' },
    ctaLabel: { control: 'text' },
    soldOutLabel: { control: 'text' },
    alternativesLabel: { control: 'text' },
    selected: { control: 'boolean' },
    unavailable: { control: 'boolean' },
    href: { control: 'text' },
    media: { control: false },
    badge: { control: false },
    rating: { control: false },
    onCta: { control: false, table: { category: 'Events' } },
    onSelect: { control: false, table: { category: 'Events' } },
  },
})

/** Layout, selected and unavailable are in Controls. */
export const Default = meta.story()

Default.test('the title selects the card, the button acts on its own', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'View dates' }))
  await expect(args.onCta).toHaveBeenCalledOnce()
  await expect(args.onSelect).not.toHaveBeenCalled()
  await userEvent.click(canvas.getByRole('button', { name: 'Paper Kingdoms' }))
  await expect(args.onSelect).toHaveBeenCalledOnce()
})

/** Figma layout: vertical · horizontal · compact. */
export const Layouts = meta.story({
  render: (args) => (
    <div className="flex w-160 max-w-full flex-col gap-6">
      <OfferCard {...args} layout="vertical" />
      <OfferCard {...args} layout="horizontal" />
      <OfferCard {...args} layout="compact" />
    </div>
  ),
})

/** Figma state: default · selected · unavailable (hover and focus come from the State control). */
export const States = meta.story({
  render: (args) => (
    <div className="flex w-160 max-w-full flex-col gap-6">
      {(['horizontal', 'compact'] as const).map((layout) => (
        <div key={layout} className="flex flex-col gap-3">
          <OfferCard {...args} layout={layout} />
          <OfferCard {...args} layout={layout} selected />
          <OfferCard {...args} layout={layout} unavailable />
        </div>
      ))}
    </div>
  ),
})

States.test('selected is announced and unavailable offers alternatives', async ({ canvas }) => {
  await expect(canvas.getAllByRole('button', { name: 'Paper Kingdoms', pressed: true })).toHaveLength(2)
  await expect(canvas.getAllByRole('button', { name: 'See alternatives' })).toHaveLength(1)
  await expect(canvas.getAllByText('Sold out')).toHaveLength(2)
})

/** Without a badge, rating or button: Figma show badge / rating / cta off. */
export const Minimal = meta.story({
  args: { badge: undefined, rating: undefined, ctaLabel: undefined, meta: undefined },
})

/** A link card: the title is an anchor stretched over the card. */
export const AsLink = meta.story({
  args: { href: '#paper-kingdoms', onSelect: undefined },
})
