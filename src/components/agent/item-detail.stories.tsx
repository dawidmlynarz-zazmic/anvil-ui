import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Badge } from '@/components/ui/badge'
import { AccessibilityIcon, CalendarIcon, ClockIcon, HeartIcon, UsersIcon } from '@/components/ui/icon'

import { ItemDetail } from './item-detail'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-15913'

const meta = preview.meta({
  title: 'Agent Builder/Catalog & scheduling/Item Detail',
  tags: ['agent-builder'],
  component: ItemDetail,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'media · badges · title · subtitle',
        values: 'slots · text',
        code: '`media` · `badges` · `title` · `subtitle`',
      },
      { property: 'rating', values: 'instance', code: '`rating` ({ value, label })' },
      { property: 'quick facts', values: 'instances', code: '`facts` (icon + label pills)' },
      { property: 'description · note', values: 'text', code: '`description` · `note` + `noteIcon`' },
      {
        property: 'actions',
        values: 'buttons',
        code: '`primary` · `secondary` · `tertiary` ({ label, icon, onClick })',
      },
    ],
    guide: {
      use: [
        'The full view of one item once the user has picked it: a show, a stay, a product, a provider, a fund.',
        'Put the quick facts (duration, age, days) in `facts` and anything that may stop the booking in `note`.',
        'The primary action moves the task on (“Check dates”); Save and a link out are secondary.',
      ],
      avoid: [
        'A list of results: use Offer Card or Offer Carousel.',
        'Several photos: use Media Gallery above or beside it.',
        'Comparing items: use Comparison Table.',
      ],
      content: [
        '`title` is the name; `subtitle` joins what, where and when with “·”.',
        '`description` is one or two sentences on why it fits what the user asked for.',
        '`note` states a requirement or policy plainly (“Step-free access to all levels”).',
      ],
      a11y: [
        'The card is an `<article>` with a heading; the rating reads once as “Rated 4.8 out of 5”.',
        'The note is a static `role="note"`, not an alert, so it is not announced on arrival.',
      ],
    },
    docs: {
      description: {
        component:
          'The full view of one item (`@/components/agent/item-detail`): `media`, `badges`, `title`, `subtitle`, `rating`, `facts`, `description`, `note` and up to three actions (`primary`, `secondary`, `tertiary`). Built on Card, Rating Display, Badge, Alert (note) and Button.',
      },
    },
  },
  args: {
    badges: (
      <>
        <Badge variant="subtle" tone="info" size="sm">
          Musical
        </Badge>
        <Badge variant="subtle" tone="warning" size="sm">
          Selling fast
        </Badge>
      </>
    ),
    title: 'Paper Kingdoms',
    subtitle: 'Lyric Hall · Manchester · 3 Oct – 15 Nov 2026',
    rating: { value: 4.8, label: '4.8 · 2,341 reviews' },
    facts: [
      { icon: ClockIcon, label: '2h 40m incl. interval' },
      { icon: UsersIcon, label: 'Ages 8+' },
      { icon: CalendarIcon, label: 'Tue–Sun' },
    ],
    description:
      'A paper-cut fantasy for the whole family, and the best fit for a Saturday evening in October.',
    note: 'Step-free access to all levels. Relaxed performance on 1 Nov.',
    noteIcon: AccessibilityIcon,
    primary: { label: 'Check dates', icon: CalendarIcon, onClick: fn() },
    secondary: { label: 'Save', icon: HeartIcon, onClick: fn() },
    tertiary: { label: 'Venue info', onClick: fn() },
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    description: { control: 'text' },
    note: { control: 'text' },
    media: { control: false },
    badges: { control: false },
    rating: { control: false },
    facts: { control: false },
    noteIcon: { control: false },
    primary: { control: false },
    secondary: { control: false },
    tertiary: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="w-145 max-w-full">
        <Story />
      </div>
    ),
  ],
})

export const Default = meta.story()

Default.test('the primary action and the note', async ({ canvas, args }) => {
  await expect(canvas.getByRole('heading', { name: 'Paper Kingdoms' })).toBeVisible()
  await expect(canvas.getByRole('note')).toHaveTextContent('Step-free access')
  await userEvent.click(canvas.getByRole('button', { name: 'Check dates' }))
  await expect(args.primary?.onClick).toHaveBeenCalledOnce()
})

/** Without facts, note or secondary actions. */
export const Minimal = meta.story({
  args: { facts: undefined, note: undefined, secondary: undefined, tertiary: undefined, badges: undefined },
})
