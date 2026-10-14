import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { ShortcutHint } from './shortcut-hint'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10750-6219'

const meta = preview.meta({
  title: 'Design System/Molecules/Shortcut Hint',
  tags: ['molecule'],
  component: ShortcutHint,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'legend item (keys + label)',
        values: 'instance',
        code: '`ShortcutHint`: `keys` + `children` (the label)',
      },
    ],
    guide: {
      use: [
        'Next to a field or in a footer to say which keys do what: “Tab to accept”, “↑↓ Navigate”.',
        'Several in a row make a legend (Command Palette footer).',
      ],
      avoid: [
        'A shortcut inside a menu item or a tooltip: use `CommandShortcut` or Kbd.',
        'The only way to tell people an action exists: the control must work without the key.',
      ],
      content: [
        'Keys are symbols or short names (`⌘`, `↵`, `Tab`, `esc`); the label is a verb (“Select”, “Close”).',
      ],
      a11y: [
        'The keys are hidden from assistive tech; the label is read. Handle the real key on the control itself.',
      ],
    },
    docs: {
      description: {
        component:
          'A keyboard hint (`@/components/anvil/shortcut-hint`): the keys as Kbd, then what they do. Built on Kbd; used by the Command Palette legend and Ghost Text.',
      },
    },
  },
  args: { keys: ['Tab'], children: 'to accept' },
  argTypes: {
    keys: { control: 'object' },
    children: { control: 'text' },
  },
})

/** Keys and the label are in Controls. */
export const Default = meta.story()

/** Several keys, and a legend of hints. */
export const Legend = meta.story({
  render: () => (
    <div className="flex items-center gap-4">
      <ShortcutHint keys={['↑', '↓']}>Navigate</ShortcutHint>
      <ShortcutHint keys={['↵']}>Select</ShortcutHint>
      <ShortcutHint keys={['⌘', '↵']}>Ask AI</ShortcutHint>
      <ShortcutHint keys={['esc']}>Close</ShortcutHint>
    </div>
  ),
})

Default.test(
  'shows the keys to assistive tech as hidden and the label as text',
  async ({ canvas, canvasElement }) => {
    const hint = canvasElement.querySelector('[data-slot=shortcut-hint]')!
    await expect(hint.querySelector('[data-slot=kbd-group]')).toHaveAttribute('aria-hidden', 'true')
    await expect(canvas.getByText('to accept')).toBeVisible()
  },
)

Legend.test('lists several hints, one key group each', async ({ canvasElement }) => {
  const hints = canvasElement.querySelectorAll('[data-slot=shortcut-hint]')
  await expect(hints.length).toBeGreaterThan(1)
  for (const hint of hints) await expect(hint.querySelectorAll('kbd').length).toBeGreaterThan(0)
})
