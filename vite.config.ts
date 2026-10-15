/// <reference types="vitest/config" />
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Storybook stories run as Vitest browser tests once per theme, so a11y checks cover light and dark.
const storybookProject = (
  theme: 'light' | 'dark',
  browser: 'chromium' | 'firefox' | 'webkit' = 'chromium',
) => ({
  extends: true as const,
  // Read by .storybook/preview.tsx as the initial `theme` global (CSF Next ignores setProjectAnnotations).
  define: { __ANVIL_TEST_THEME__: JSON.stringify(theme) },
  plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
  test: {
    name: browser === 'chromium' ? `storybook-${theme}` : `storybook-${browser}`,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser }],
    },
  },
})

// Plain unit tests (src/**/*.test.ts[x]) run in the same real browser, so DOM and React behave as in production.
const unitProject = {
  extends: true as const,
  test: {
    name: 'unit',
    include: ['src/**/*.test.{ts,tsx}'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' as const }],
    },
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(dirname, './src') },
  },
  test: {
    // Known, harmless browser noise that Firefox raises while the tests drive pointer events and layout: not failures.
    onUnhandledError(error) {
      if (/setPointerCapture|ResizeObserver loop/.test(String(error.message))) return false
    },
    projects: [
      storybookProject('light'),
      storybookProject('dark'),
      // Cross-browser: the light theme in Firefox and WebKit (Safari's engine).
      storybookProject('light', 'firefox'),
      storybookProject('light', 'webkit'),
      unitProject,
    ],
  },
})
