import preview from '#.storybook/preview'
import { expect, waitFor } from 'storybook/test'

import { WelcomePage } from './welcome/WelcomePage'

// The landing page. A story (not MDX) so it follows the theme / shell / motion toolbars and is
// a11y-tested in light and dark like every component. Drawn with token utilities and real Anvil
// components only.
const meta = preview.meta({
  title: 'Welcome',
  component: WelcomePage,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    options: { showPanel: false },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10879-33679',
    },
  },
})

export const Welcome = meta.story()

Welcome.test('follows the theme toolbar', async ({ globals }) => {
  await expect(document.documentElement.classList.contains('dark')).toBe(globals.theme === 'dark')
})

Welcome.test('introduces the system and lists every area', async ({ canvas }) => {
  await expect(canvas.getByRole('heading', { level: 1, name: 'Anvil UI' })).toBeVisible()
  for (const area of ['Foundations', 'Forms', 'Overlays', 'Agent Builder']) {
    await waitFor(() => expect(canvas.getByRole('list', { name: area })).toBeInTheDocument())
  }
})
