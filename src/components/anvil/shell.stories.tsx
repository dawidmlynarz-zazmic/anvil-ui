import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  ShellCloseButton,
  ShellFooter,
  ShellHeader,
  shellDescriptionClassName,
  shellTitleClassName,
} from './shell'

const FIGMA_HEADER = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10960-223'
const FIGMA_FOOTER = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10960-260'

const meta = {
  title: 'Anvil/Shell',
  component: ShellHeader,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA_HEADER },
    docs: {
      description: {
        component:
          'Shared header and footer for every shell (Dialog, Alert Dialog, Sheet, Drawer, Popover, Card). Shells wrap them with their own Title / Description / Close. `ShellHeader` variant bar · inline; `ShellFooter` variant bar · inline × align end · between · stretch.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[548px] max-w-full overflow-hidden rounded-xl bg-background inset-ring inset-ring-overlay-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShellHeader>

export default meta
type Story = StoryObj<typeof meta>

const Title = ({ children }: { children: string }) => <h2 className={shellTitleClassName}>{children}</h2>
const Description = ({ children }: { children: string }) => (
  <p className={shellDescriptionClassName}>{children}</p>
)

export const HeaderBar: Story = {
  render: () => (
    <div className="flex flex-col">
      <ShellHeader close={<ShellCloseButton />}>
        <Title>Title</Title>
      </ShellHeader>
      <ShellHeader close={<ShellCloseButton />}>
        <Title>Title</Title>
        <Description>Subtitle</Description>
      </ShellHeader>
    </div>
  ),
}

/** Inline: no padding — the container pads it (Alert Dialog, Popover, Card). */
export const HeaderInline: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <ShellHeader variant="inline" close={<ShellCloseButton />}>
        <Title>Title</Title>
      </ShellHeader>
      <ShellHeader variant="inline">
        <Title>Title</Title>
        <Description>Subtitle</Description>
      </ShellHeader>
    </div>
  ),
}

/** Every `variant` × `align`; actions are size sm Buttons (secondary outline · neutral, primary brand). */
export const Footer: Story = {
  parameters: { design: { type: 'figma', url: FIGMA_FOOTER } },
  render: () => (
    <div className="flex flex-col gap-4 py-4">
      {(['bar', 'inline'] as const).map((variant) =>
        (['end', 'between', 'stretch'] as const).map((align) => (
          <div key={variant + align} className={cn(variant === 'inline' && 'px-4')}>
            <div className="mb-1 px-4 type-text-xs-medium text-muted-foreground">
              {variant} · {align}
            </div>
            <ShellFooter variant={variant} align={align}>
              <Button size="sm" variant="outline" intent="neutral">
                Label
              </Button>
              <Button size="sm">Label</Button>
            </ShellFooter>
          </div>
        )),
      )}
    </div>
  ),
}
