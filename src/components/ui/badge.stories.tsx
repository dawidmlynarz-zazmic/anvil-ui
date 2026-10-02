import type { Meta, StoryObj } from '@storybook/react-vite'
import { Clock, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { expect } from 'storybook/test'

import { Badge } from './badge'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=1482-30693'
const variants = ['default', 'outline', 'subtle'] as const
const intents = ['neutral', 'inverse'] as const
const sizes = ['default', 'sm', 'xs'] as const

/** Inverse badges sit on inverse surfaces. */
function Surface({ intent, children }: { intent?: string | null; children: ReactNode }) {
  return (
    <div
      className={
        intent === 'inverse'
          ? 'flex flex-wrap items-center gap-3 rounded-lg bg-background-inverse p-3'
          : 'flex flex-wrap items-center gap-3 p-3'
      }
    >
      {children}
    </div>
  )
}

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Compact label for counts and metadata (shadcn/ui Badge). `variant` default (solid) · outline · subtle; `intent` neutral · inverse (on inverse surfaces). Status colors are the Anvil StatusBadge.',
      },
    },
  },
  args: { children: 'Label', variant: 'default', intent: 'neutral', size: 'default' },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    intent: { control: 'inline-radio', options: intents },
    size: { control: 'inline-radio', options: sizes },
    asChild: { table: { disable: true } },
  },
  render: (args) => (
    <Surface intent={args.intent}>
      <Badge {...args} />
    </Surface>
  ),
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const badge = canvas.getByText('Label')
    await expect(badge).toHaveAttribute('data-slot', 'badge')
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {intents.map((intent) => (
        <Surface key={intent} intent={intent}>
          {variants.map((variant) => (
            <Badge key={variant} variant={variant} intent={intent}>
              Label
            </Badge>
          ))}
        </Surface>
      ))}
    </div>
  ),
}

/** 24 / 20 / 18 px with text sm / xs / 2xs medium. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {variants.map((variant) => (
        <Surface key={variant}>
          {sizes.map((size) => (
            <Badge key={size} variant={variant} size={size}>
              Label
            </Badge>
          ))}
        </Surface>
      ))}
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Surface>
      <Badge>
        <Sparkles />
        Label
      </Badge>
      <Badge variant="outline">
        <Clock />
        Label
      </Badge>
      <Badge variant="subtle">12</Badge>
    </Surface>
  ),
}

/** A count next to a label, and asChild for linked tags (they get the focus ring). */
export const Composition: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center gap-2 type-text-sm-medium text-foreground">
        Label <Badge size="sm">24</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge asChild variant="outline">
          <a href="#tag">Label 1</a>
        </Badge>
        <Badge asChild variant="outline">
          <a href="#tag">Label 2</a>
        </Badge>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Label 2' })).toHaveAttribute('data-slot', 'badge')
  },
}
