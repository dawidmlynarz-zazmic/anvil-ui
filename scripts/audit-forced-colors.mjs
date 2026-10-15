// Opens stories in forced-colors mode (Windows High Contrast emulation) and reports controls that lose their
// boundary or their selected state. Usage: node scripts/audit-forced-colors.mjs [titlePrefix]
// (Storybook must be running on :6006). Checks, per story:
//  - field-like controls (the hidden OTP input is skipped; its slots are the visible boxes) (input, textarea, select, checkbox, radio, switch, combobox) must have a visible border or outline;
//  - anything checked / pressed / selected must be drawn with the selection colour (Highlight).
import { chromium } from 'playwright'

const prefix = process.argv[2] ?? ''
const base = 'http://localhost:6006'
const index = await (await fetch(`${base}/index.json`)).json()
const stories = Object.values(index.entries).filter((e) => e.type === 'story' && e.title.startsWith(prefix))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, forcedColors: 'active' })
const problems = []
for (const story of stories) {
  await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'load' })
  await page.waitForTimeout(400)
  const found = await page.evaluate(() => {
    const out = []
    const probe = document.createElement('div')
    probe.style.backgroundColor = 'Highlight'
    document.body.append(probe)
    const highlight = getComputedStyle(probe).backgroundColor
    probe.remove()
    const visible = (el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
    }
    const bounded = (el) => {
      const c = getComputedStyle(el)
      const border = parseFloat(c.borderTopWidth) > 0 && c.borderTopStyle !== 'none'
      const outline = parseFloat(c.outlineWidth) > 0 && c.outlineStyle !== 'none'
      return border || outline
    }
    const label = (el) => `${el.tagName.toLowerCase()}${el.dataset.slot ? `[${el.dataset.slot}]` : ''}`
    for (const el of document.querySelectorAll(
      'input:not([type=hidden]):not(.sr-only):not([data-slot=input-otp]), textarea, select, [role=checkbox], [role=radio], [role=switch], [role=combobox]',
    )) {
      if (visible(el) && !el.closest('.sr-only') && !bounded(el))
        out.push(`${label(el)} has no visible boundary`)
    }
    for (const el of document.querySelectorAll(
      '[aria-pressed=true], [aria-checked=true], [role=tab][aria-selected=true], [data-state=on], [data-state=checked]',
    )) {
      if (visible(el) && getComputedStyle(el).backgroundColor !== highlight)
        out.push(`${label(el)} selected state is not drawn in Highlight`)
    }
    return out.slice(0, 4)
  })
  if (found.length) problems.push({ id: story.id, found })
}
await browser.close()
for (const p of problems) console.log(`${p.id}\n  ${p.found.join('\n  ')}`)
console.log(`\n${stories.length} stories, ${problems.length} with problems in forced colors`)
