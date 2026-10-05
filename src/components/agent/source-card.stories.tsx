import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { SourceCard } from './source-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10713-887'

const CREDIBILITY = ['high', 'medium', 'low'] as const

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Sources/Source Card',
  component: SourceCard,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'A source with its credibility and usage, for research and review flows (`@/components/agent/source-card`): `publisher`, `meta`, `icon`, `tag`, `title`, `excerpt`, `credibility` (high · medium · low), `usage`. Actions: Open (`href`) and Exclude (`onExclude`); `excluded` (Figma state excluded) shows the Excluded badge and Restore (`onRestore`).',
      },
    },
  },
  args: {
    publisher: 'Title',
    meta: 'label.com · 14 May 2026',
    tag: 'Label',
    title: 'Title',
    excerpt: 'Subtitle',
    credibility: 'high' as const,
    usage: 'Label',
    excluded: false,
    href: '#source',
  },
  argTypes: { credibility: { control: 'inline-radio', options: CREDIBILITY } },
  render: (args) => (
    <div className="w-130">
      <SourceCard {...args} onExclude={() => {}} onRestore={() => {}} />
    </div>
  ),
})

/** Every field, credibility and excluded are in Controls. */
export const Default = meta.story()

Default.test('names its credibility and offers Open and Exclude', async ({ canvas }) => {
  await expect(canvas.getByText('High credibility')).toBeVisible()
  await expect(canvas.getByRole('link', { name: 'Open source' })).toHaveAttribute('href', '#source')
  await expect(canvas.getByRole('button', { name: 'Exclude source' })).toBeEnabled()
})

/** Figma credibility × state (default, excluded). */
export const Variants = meta.story({
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      {CREDIBILITY.map((credibility) =>
        [false, true].map((excluded) => (
          <div key={`${credibility}-${excluded}`} className="w-130">
            <SourceCard
              {...args}
              credibility={credibility}
              excluded={excluded}
              onExclude={() => {}}
              onRestore={() => {}}
            />
          </div>
        )),
      )}
    </div>
  ),
})

/** Exclude and Restore switch the card. */
export const Interactive = meta.story({
  render: function Render(args) {
    const [excluded, setExcluded] = useState(false)
    return (
      <div className="w-130">
        <SourceCard
          {...args}
          excluded={excluded}
          onExclude={() => setExcluded(true)}
          onRestore={() => setExcluded(false)}
        />
      </div>
    )
  },
})

Interactive.test('exclude, then restore', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Exclude source' }))
  await expect(canvas.getByText('Excluded')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Restore source' }))
  await expect(canvas.queryByText('Excluded')).not.toBeInTheDocument()
})
