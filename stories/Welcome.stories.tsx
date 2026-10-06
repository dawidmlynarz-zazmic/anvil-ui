import preview from '#.storybook/preview'

import { WelcomePage } from './welcome/WelcomePage'

// The landing page. A story (not MDX) so it follows the theme / shell / motion toolbars and is
// a11y-tested in light and dark like every component. Drawn with token utilities and real Anvil
// components only.
const meta = preview.meta({
  title: 'Welcome',
  tags: ['!autodocs'],
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

// One page: no Story.test here (tests show as sub-pages in the sidebar). The story itself still
// renders in light and dark with accessibility checks.
export const Welcome = meta.story()
