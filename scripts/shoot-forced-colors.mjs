// Screenshots stories with the browser's forced-colors (Windows High Contrast) emulation.
// Usage: node scripts/shoot-forced-colors.mjs <outDir> <storyId>...   (Storybook running on :6006)
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const [out, ...ids] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 720, height: 520 },
  forcedColors: 'active',
  colorScheme: 'light',
})
for (const id of ids) {
  await page.goto(`http://localhost:6006/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'load' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${out}/${id}.png` })
}
await browser.close()
