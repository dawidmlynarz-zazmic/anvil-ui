import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { CheckRow } from './check-row'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10847-5075'

const STATUSES = ['included', 'excluded', 'fee', 'pending'] as const

const meta = preview.meta({
  title: 'Design System/Atoms/Check Row',
  tags: ['atom'],
  component: CheckRow,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'status', values: 'included · excluded · fee · pending', code: '`status` prop' },
      { property: 'label', values: 'text', code: '`children`' },
    ],
    guide: {
      use: [
        'A list of what an option includes: fares, plans, permissions, specs.',
        'Mix statuses in one list so people can compare what is in, out, extra or not confirmed.',
      ],
      avoid: [
        'A to-do list with checkboxes people tick: use Checkbox.',
        'Progress of a running step: use Step Status or Tool Log Line.',
        'A feature table across several options: use Table with check marks.',
      ],
      content: [
        'Label names the thing, not the status (“Checked bag”); the glyph and hidden text say included, extra fee and so on.',
        'For a fee, give the amount in the label when you know it (“Checked bag · $30”).',
      ],
      a11y: [
        'Each row also says its status in words for screen readers (`statusLabel`, visually hidden).',
        'The glyph is decorative and never the only signal.',
      ],
    },
    docs: {
      description: {
        component:
          'One line of an inclusion list (`@/components/anvil/check-row`): `status` included · excluded · fee · pending with a glyph, the label as `children`, and the status in words for assistive tech.',
      },
    },
  },
  args: { status: 'included', children: 'Label' },
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES },
    statusLabel: { control: 'text' },
    children: { control: 'text' },
  },
  render: (args) => (
    <div className="w-70">
      <CheckRow {...args} />
    </div>
  ),
})

/** Status and the label are in Controls. */
export const Default = meta.story()

/** Figma status: included, excluded, fee, pending. */
export const Statuses = meta.story({
  render: () => (
    <div className="flex w-70 flex-col gap-2">
      {STATUSES.map((status) => (
        <CheckRow key={status} status={status}>
          Label
        </CheckRow>
      ))}
    </div>
  ),
})

Statuses.test('each status is also said in words', async ({ canvas }) => {
  await expect(canvas.getByText(/^Included:/)).toBeInTheDocument()
  await expect(canvas.getByText(/^Not included:/)).toBeInTheDocument()
  await expect(canvas.getByText(/^Extra fee:/)).toBeInTheDocument()
  await expect(canvas.getByText(/^Pending:/)).toBeInTheDocument()
})
