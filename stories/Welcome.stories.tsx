import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

// Placeholder story for the Step 1 exit gate. Replaced by Foundations in Step 2.
function Welcome() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Anvil UI</h1>
      <p className="mt-2 text-sm">
        Zazmic&apos;s design system for conversational AI agents. Tokens arrive in Step 2, components from
        Step 3.
      </p>
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
