import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-designs',
    // storybook-addon-pseudo-states is loaded in preview.tsx only (stylesheet rewriting for the
    // State control); its toolbar is left out because its global leaks between stories.
  ],
  framework: '@storybook/react-vite',
  // Anvil draws its own surfaces from tokens; the backgrounds toolbar would fight the theme toggle.
  features: { backgrounds: false, experimentalTestSyntax: true },
}

export default config
