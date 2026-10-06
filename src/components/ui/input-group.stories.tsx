import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { CommandIcon, CopyIcon, Icon, SearchIcon } from './icon'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group'
import { Kbd } from './kbd'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=1623-6796'

function Search({ size }: { size?: 'sm' | 'default' | 'lg' }) {
  return (
    <InputGroup size={size}>
      <InputGroupAddon>
        <Icon icon={SearchIcon} />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search conversations" placeholder="Search conversations" />
      <InputGroupAddon align="inline-end">
        <Kbd>
          <Icon icon={CommandIcon} />K
        </Kbd>
      </InputGroupAddon>
    </InputGroup>
  )
}

const meta = preview.meta({
  title: 'Design System/Molecules/Input Group',
  tags: ['molecule'],
  component: InputGroup,
  parameters: {
    shadcn: 'input-group',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'size', values: 'lg · default · sm', code: '`size` prop on `InputGroup`' },
      {
        property: 'state',
        values: 'default · hover · focus',
        code: 'selectors: `hover:` · `has-[…:focus-visible]:` on the group (not a prop)',
      },
      {
        property: 'show shortcut',
        values: 'boolean',
        code: 'an `InputGroupAddon align="inline-end"` with a `Kbd`, or not',
      },
    ],
    guide: {
      use: [
        'An input that needs a fixed icon, prefix, suffix or inline action: search with a ⌘K hint, a URL with `https://`, a share link with Copy.',
        'A textarea with a footer row of hints or actions (the start of a composer).',
      ],
      avoid: [
        'A plain labelled field: use Input with `label` / `hint`. A full chat composer: use the agent Composer.',
        'An input next to a separate button (Search, Apply): use Button Group.',
      ],
      content: [
        'Placeholders say what is searched or typed (“Search conversations”), never stand in for a label.',
        'Text addons are short units or prefixes (“https://”, “MB”); hints in a block-end addon are one line.',
      ],
      a11y: [
        'The group has no visible label: give the input `aria-label` or `aria-labelledby`.',
        'Icon addons are decorative; inline buttons need an `aria-label` that names their action (“Copy link”).',
        'Clicking an addon focuses the input; the group shows one focus ring.',
      ],
    },
    docs: {
      description: {
        component:
          'An input with addons — icons, text, buttons or a Kbd shortcut (shadcn/ui Input Group). Figma `search` is an Input Group with a search icon and a ⌘K hint. `size` sm · default · lg (32 / 40 / 48). The group draws the field and its states; clicking an addon focuses the input.',
      },
    },
  },
  args: { size: 'default' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    className: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  render: (args) => <Search size={args.size ?? undefined} />,
})

/** Figma `search`. */
export const Default = meta.story()

Default.test('clicking an addon focuses the input', async ({ canvas, canvasElement }) => {
  const input = canvas.getByRole('textbox', { name: 'Search conversations' })
  await userEvent.click(canvasElement.querySelector('[data-slot=input-group-addon]')!)
  await expect(input).toHaveFocus()
  await userEvent.keyboard('pricing')
  await expect(input).toHaveValue('pricing')
})

/** 32 / 40 / 48 px. */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <Search size="sm" />
      <Search size="default" />
      <Search size="lg" />
    </div>
  ),
})

/** Figma states side by side (rows: default · hover · invalid · disabled). For one group, use the State control on Default. */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>
          <Icon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search conversations" placeholder="Search conversations" />
      </InputGroup>
      <span className="pseudo-hover-all contents">
        <InputGroup>
          <InputGroupAddon>
            <Icon icon={SearchIcon} />
          </InputGroupAddon>
          <InputGroupInput aria-label="Search files" placeholder="Search files" />
        </InputGroup>
      </span>
      <InputGroup>
        <InputGroupAddon>
          <Icon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search sources" defaultValue="site:" aria-invalid />
      </InputGroup>
      <InputGroup data-disabled="true">
        <InputGroupAddon>
          <Icon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search people" placeholder="Search people" disabled />
      </InputGroup>
    </div>
  ),
})

/** Text addons and an inline button (shadcn Input Group parts). */
export const TextAndButton = meta.story({
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Share link"
        defaultValue="northwind.example/share/q3-launch-plan"
        readOnly
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Copy link">
          <Icon icon={CopyIcon} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
})

/** With a textarea and a block-end addon. */
export const WithTextarea = meta.story({
  render: () => (
    <InputGroup>
      <InputGroupTextarea aria-label="Message the assistant" placeholder="Ask about the Q3 launch plan…" />
      <InputGroupAddon align="block-end">
        <InputGroupText>Enter to send · Shift+Enter for a new line</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
})
