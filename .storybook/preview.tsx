import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import { definePreview, type Decorator } from '@storybook/react-vite'
import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import addonThemes, { withThemeByClassName } from '@storybook/addon-themes'
import addonPseudoStates from 'storybook-addon-pseudo-states'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import '@/styles/globals.css'

import { STATE_ARG, withInteractionState } from './interaction-state'
import { withSyncedOpen } from './sync-open'

// Set per Vitest project (vite.config.ts): storybook-light / storybook-dark.
declare const __ANVIL_TEST_THEME__: 'light' | 'dark' | undefined
const testTheme = typeof __ANVIL_TEST_THEME__ === 'undefined' ? undefined : __ANVIL_TEST_THEME__

type Shell = 'full-screen' | 'side-panel' | 'popover' | 'mobile'

// Shell toolbar → data-shell on a wrapper (shell tokens); motion toolbar → .no-motion on <html>.
function AnvilProviders({
  shell,
  motion,
  theme,
  children,
}: {
  shell: Shell
  motion: 'on' | 'off'
  theme: 'light' | 'dark'
  children: ReactNode
}) {
  useEffect(() => {
    document.documentElement.classList.toggle('no-motion', motion === 'off')
  }, [motion])

  // The themes addon sets .dark after mount, so the first frame paints light and colors animate
  // into dark. Apply the class before paint as well (same class, so the two agree).
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <TooltipProvider>
      <div data-shell={shell}>{children}</div>
      <Toaster theme={theme} />
    </TooltipProvider>
  )
}

const withAnvilProviders: Decorator = (Story, context) => (
  <AnvilProviders
    shell={(context.globals.shell ?? 'full-screen') as Shell}
    motion={context.globals.motion === 'off' ? 'off' : 'on'}
    theme={context.globals.theme === 'dark' ? 'dark' : 'light'}
  >
    <Story />
  </AnvilProviders>
)

// Stories open in their default state. Interactions live in `Story.test()` (run by Vitest and from
// the sidebar), never in `play`, so viewing a story never clicks, types, focuses or opens anything.
// Hover / focus / pressed are previewed with the per-story "State" control (interaction-state.tsx);
// storybook-addon-pseudo-states only rewrites the stylesheets: its toolbar global is not registered
// (main.ts), because globals persist across stories. Overlays: a boolean `open` arg is a live
// control (sync-open.tsx); stories that open on load prevent Radix's initial focus.
export default definePreview({
  addons: [addonDocs(), addonA11y(), addonThemes(), addonPseudoStates()],
  decorators: [
    withSyncedOpen,
    withInteractionState,
    withAnvilProviders,
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
  ],
  globalTypes: {
    shell: {
      description: 'Anvil shell mode (shell tokens)',
      toolbar: {
        title: 'Shell',
        icon: 'browser',
        items: [
          { value: 'full-screen', title: 'Full screen' },
          { value: 'side-panel', title: 'Side panel' },
          { value: 'popover', title: 'Popover' },
          { value: 'mobile', title: 'Mobile' },
        ],
        dynamicTitle: true,
      },
    },
    motion: {
      description: 'Animations and transitions',
      toolbar: {
        title: 'Motion',
        icon: 'lightning',
        items: [
          { value: 'on', title: 'Motion on' },
          { value: 'off', title: 'Motion off' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    shell: 'full-screen',
    motion: 'on',
    ...(testTheme ? { theme: testTheme } : {}),
  },
  argTypes: {
    [STATE_ARG]: {
      name: 'State',
      description:
        'Preview an interaction state (Storybook only, not a prop). Default is the resting state; real focus and hover still work.',
      control: 'inline-radio',
      options: ['default', 'hover', 'focus-visible', 'focus', 'active'],
      table: { category: 'Interaction state', defaultValue: { summary: 'default' } },
    },
  },
  args: { [STATE_ARG]: 'default' },
  parameters: {
    a11y: { test: 'error' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i }, sort: 'requiredFirst' },
    options: {
      // Groups in a fixed order (Agent Builder sub-groups and Core Kit sections follow Figma), components A–Z
      // inside a group, stories in file order. Plain JS, no outside references: Storybook evaluates
      // this function's source on its own.
      storySort: (a, b) => {
        const groups = ['Welcome', 'Foundations', 'Components', 'Custom Components', 'Agent Builder']
        const agent = ['Primitives', 'Core Kit', 'Agent Patterns', 'Surfaces', 'Templates']
        const pa = a.title.split('/')
        const pb = b.title.split('/')
        const ga = groups.indexOf(pa[0])
        const gb = groups.indexOf(pb[0])
        if (ga !== gb) return (ga === -1 ? 99 : ga) - (gb === -1 ? 99 : gb)
        if (pa[0] === 'Agent Builder' && pa[1] !== pb[1]) {
          const sa = agent.indexOf(pa[1])
          const sb = agent.indexOf(pb[1])
          if (sa !== sb) return (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb)
        }
        // Core Kit sections follow the Figma page.
        const kit = [
          'Shell',
          'Input',
          'Messages',
          'Agent States',
          'Sources',
          'System & Context',
          'Widgets & Artifacts',
          'Feedback & Surveys',
        ]
        if (pa[1] === 'Core Kit' && pb[1] === 'Core Kit' && pa[2] !== pb[2]) {
          const ka = kit.indexOf(pa[2])
          const kb = kit.indexOf(pb[2])
          if (ka !== kb) return (ka === -1 ? 99 : ka) - (kb === -1 ? 99 : kb)
        }
        if (pa[0] === 'Welcome' || pa[0] === 'Foundations' || a.title === b.title) return 0
        return a.title.localeCompare(b.title)
      },
    },
  },
})
