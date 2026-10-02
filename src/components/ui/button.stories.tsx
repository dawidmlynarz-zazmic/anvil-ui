import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, ChevronLeft, ChevronRight, Plus, Sparkles, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from './button'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=917-9268'
const FIGMA_ICON = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8218-5908'

const variants = ['default', 'outline', 'ghost'] as const
const intents = ['brand', 'neutral', 'destructive', 'inverse'] as const
const sizes = ['xs', 'sm', 'default', 'lg'] as const
const iconSizes = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const

/** Inverse buttons sit on inverse surfaces (tooltips, dark chips, media). */
function Surface({ intent, children }: { intent?: string; children: ReactNode }) {
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

const Label = ({ children }: { children: ReactNode }) => (
  <div className="w-24 shrink-0 type-text-xs-medium text-muted-foreground">{children}</div>
)

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Primary action control (shadcn/ui Button). `variant` sets the appearance, `intent` the color role. Icon-only buttons use an `icon*` size and need an accessible label. `shape="pill"` / `"circle"` inside fully rounded containers.',
      },
    },
  },
  args: {
    children: 'Label',
    variant: 'default',
    intent: 'brand',
    size: 'default',
    shape: 'default',
    loading: false,
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    intent: { control: 'inline-radio', options: intents },
    size: { control: 'select', options: [...sizes, ...iconSizes] },
    shape: { control: 'inline-radio', options: ['default', 'pill', 'circle'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    asChild: { table: { disable: true } },
  },
  render: (args) => (
    <Surface intent={args.intent ?? undefined}>
      <Button {...args} />
    </Surface>
  ),
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Label' })
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
    button.blur()
    await userEvent.tab()
    await expect(button).toHaveFocus()
  },
}

/** Every `variant` × `intent` at the default size. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {intents.map((intent) => (
        <div key={intent} className="flex items-center gap-2">
          <Label>{intent}</Label>
          <Surface intent={intent}>
            {variants.map((variant) => (
              <Button key={variant} variant={variant} intent={intent}>
                Label
              </Button>
            ))}
          </Surface>
        </div>
      ))}
    </div>
  ),
}

/** Text sizes 24 / 32 / 40 / 48 px and icon sizes; `xs` uses 12px icons. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        {sizes.map((size) => (
          <Button key={size} size={size}>
            <Plus />
            Label
          </Button>
        ))}
      </Surface>
      <Surface>
        {iconSizes.map((size) => (
          <Button key={size} size={size} aria-label="Label">
            <Plus />
          </Button>
        ))}
      </Surface>
    </div>
  ),
}

export const Shapes: Story = {
  render: () => (
    <Surface>
      <Button>Label</Button>
      <Button shape="pill">Label</Button>
      <Button variant="outline" intent="neutral" shape="pill">
        Label
      </Button>
      <Button size="icon" shape="circle" aria-label="Label">
        <Plus />
      </Button>
      <Button size="icon" variant="outline" intent="neutral" shape="circle" aria-label="Label">
        <ChevronRight />
      </Button>
    </Surface>
  ),
}

/** Figma `state` values as selectors: hover and focus are forced with storybook-addon-pseudo-states. */
export const States: Story = {
  parameters: {
    pseudo: {
      hover: ['[data-demo="hover"]'],
      focusVisible: ['[data-demo="focus"]'],
    },
  },
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Label>{''}</Label>
        <div className="flex gap-3 px-3">
          {['default', 'hover', 'focus', 'disabled', 'loading'].map((state) => (
            <div key={state} className="w-24 type-text-xs-medium text-muted-foreground">
              {state}
            </div>
          ))}
        </div>
      </div>
      {intents.map((intent) =>
        variants.map((variant) => (
          <div key={intent + variant} className="flex items-center gap-2">
            <Label>
              {intent} · {variant}
            </Label>
            <Surface intent={intent}>
              <Button variant={variant} intent={intent}>
                Label
              </Button>
              <Button variant={variant} intent={intent} data-demo="hover">
                Label
              </Button>
              <Button variant={variant} intent={intent} data-demo="focus">
                Label
              </Button>
              <Button variant={variant} intent={intent} disabled>
                Label
              </Button>
              <Button variant={variant} intent={intent} loading>
                Label
              </Button>
            </Surface>
          </div>
        )),
      )}
    </div>
  ),
}

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Label' })
    await expect(button).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(button, { pointerEventsCheck: 0 })
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Label' })).toBeDisabled()
  },
}

export const WithIcons: Story = {
  render: () => (
    <Surface>
      <Button>
        <ChevronLeft />
        Label
      </Button>
      <Button variant="outline" intent="neutral">
        Label
        <ArrowRight />
      </Button>
      <Button variant="ghost" intent="brand">
        <Sparkles />
        Label
      </Button>
      <Button intent="destructive">
        <Trash2 />
        Label
      </Button>
    </Surface>
  ),
}

/** Icon-only buttons (Figma `icon button`): always pass an accessible label. */
export const IconButtons: Story = {
  parameters: { design: { type: 'figma', url: FIGMA_ICON } },
  render: () => (
    <div className="flex flex-col gap-2">
      {intents.map((intent) => (
        <div key={intent} className="flex items-center gap-2">
          <Label>{intent}</Label>
          <Surface intent={intent}>
            {variants.map((variant) => (
              <Button key={variant} size="icon" variant={variant} intent={intent} aria-label="Label">
                <Plus />
              </Button>
            ))}
          </Surface>
        </div>
      ))}
    </div>
  ),
}

/** A footer action row, and `asChild` rendering a link. */
export const Composition: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-end gap-2 rounded-lg border border-border p-4">
        <Button variant="ghost" intent="neutral">
          Label
        </Button>
        <Button>Label</Button>
      </div>
      <Button asChild variant="outline" intent="brand">
        <a href="#docs">
          Label
          <ArrowRight />
        </a>
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Label' })
    await expect(link).toHaveAttribute('data-slot', 'button')
  },
}
