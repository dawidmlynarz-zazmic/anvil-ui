import { useEffect, type ReactNode } from 'react'
import type { Decorator, Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import '@/styles/globals.css'

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

const preview: Preview = {
  decorators: [
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
  },
  parameters: {
    a11y: { test: 'error' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: { order: ['Welcome', 'Foundations', 'Components', 'Anvil', 'Agent'] },
    },
  },
}

export default preview
