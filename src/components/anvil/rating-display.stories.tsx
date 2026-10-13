import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { RatingDisplay } from './rating-display'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10855-5609'

const meta = preview.meta({
  title: 'Design System/Atoms/Rating Display',
  tags: ['atom'],
  component: RatingDisplay,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'display', values: 'compact · stars', code: '`display` prop' },
      {
        property: 'value',
        values: '3 · 4 · 5 (stars)',
        code: '`value` prop (0–5; the filled stars round to the nearest)',
      },
      { property: 'label · show label', values: 'text · boolean', code: '`label` (pass it or not)' },
    ],
    guide: {
      use: [
        'To show an existing rating on an offer, a provider or a place, with how many reviews it rests on.',
        '`compact` in tight rows (cards, lists); `stars` where the rating is the point (item detail).',
      ],
      avoid: [
        'Asking the user to rate: use Rating (the satisfaction check) or Rating Scale.',
        'A score with no number of reviews: say how many it rests on.',
      ],
      content: ['Label: score · count (“4.6 · 1,204 reviews”). Round the score to one decimal.'],
      a11y: [
        'The display is one image named “Rated 4.6 out of 5, 4.6 · 1,204 reviews”; the stars are decorative.',
      ],
    },
    docs: {
      description: {
        component:
          'A read-only rating (`@/components/anvil/rating-display`): `value` 0–5, `display` compact (one star) · stars (five), `label` for the score and count. Collecting feedback is the Rating component.',
      },
    },
  },
  args: { value: 4.6, display: 'stars' as const, label: '4.6 · 1,204 reviews' },
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 5, step: 0.1 } },
    display: { control: 'inline-radio', options: ['compact', 'stars'] },
    label: { control: 'text' },
  },
})

/** Display, value and label are in Controls. */
export const Default = meta.story()

Default.test('is one named image', async ({ canvas }) => {
  await expect(canvas.getByRole('img', { name: 'Rated 4.6 out of 5, 4.6 · 1,204 reviews' })).toBeVisible()
})

/** Figma display × value. */
export const Variants = meta.story({
  render: (args) => (
    <div className="flex flex-col gap-3">
      <RatingDisplay {...args} display="compact" />
      {[3, 4, 5].map((value) => (
        <RatingDisplay key={value} {...args} value={value} />
      ))}
    </div>
  ),
})
