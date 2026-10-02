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
const storybookProject = (theme: 'light' | 'dark') => ({
  extends: true as const,
  plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
  test: {
    name: `storybook-${theme}`,
    provide: { theme },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' as const }],
    },
    setupFiles: ['.storybook/vitest.setup.ts'],
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(dirname, './src') },
  },
  test: {
    projects: [storybookProject('light'), storybookProject('dark')],
  },
})
