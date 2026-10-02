import { setProjectAnnotations } from '@storybook/react-vite'
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview'
import { inject } from 'vitest'

import * as projectAnnotations from './preview'

// Each Vitest project (storybook-light, storybook-dark) provides its theme; see vite.config.ts.
setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
  { initialGlobals: { theme: inject('theme') } },
])

declare module 'vitest' {
  export interface ProvidedContext {
    theme: 'light' | 'dark'
  }
}
