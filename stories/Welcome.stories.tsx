import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

// Intro page drawn with token utilities only, so the light and dark test projects check real
// token colors for a11y contrast.
function Welcome() {
  return (
    <div className="flex flex-col gap-4 bg-background p-(--space-lg) text-foreground">
      <h1 className="type-heading-3xl">Anvil UI</h1>
      <p className="type-text-base-normal text-muted-foreground">
        Zazmic&apos;s design system for conversational AI agents. Start with Foundations (tokens), then
        Components.
      </p>
      <div className="flex gap-2">
        <span className="rounded-md bg-agent-subtle px-2 py-1 type-text-sm-medium text-agent-strong">
          Label
        </span>
        <span className="rounded-md bg-info-subtle px-2 py-1 type-text-sm-medium text-info-strong">
          Label
        </span>
        <span className="rounded-md bg-primary px-2 py-1 type-text-sm-medium text-primary-foreground">
          Label
        </span>
      </div>
      <div className="w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-elevation-raised">
        <p className="type-text-sm-normal">Subtitle</p>
        <a className="type-text-sm-link text-foreground-link focus-ring rounded-sm" href="#tokens">
          Label
        </a>
      </div>
    </div>
  )
}

const meta = {
  title: 'Welcome',
  component: Welcome,
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10879-33679',
    },
  },
} satisfies Meta<typeof Welcome>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // Exit gate check: the theme toolbar (and the storybook-dark test project) puts .dark on <html>.
  play: async ({ globals }) => {
    await expect(document.documentElement.classList.contains('dark')).toBe(globals.theme === 'dark')
  },
}
