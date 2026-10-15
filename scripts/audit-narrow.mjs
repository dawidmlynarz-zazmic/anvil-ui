// Opens every story at a phone width and reports horizontal overflow and clipped text.
// Usage: node scripts/audit-narrow.mjs [titlePrefix] [width] [globals]   (Storybook must be running on :6006)
// `globals` is a Storybook globals string, e.g. `locale:ar-SA` for a right-to-left run (pnpm audit:rtl).
import { chromium } from 'playwright'

const prefix = process.argv[2] ?? 'Agent Builder'
const width = Number(process.argv[3] ?? 390)
const globals = process.argv[4] ? `&globals=${process.argv[4]}` : ''
const base = 'http://localhost:6006'
const index = await (await fetch(`${base}/index.json`)).json()
const stories = Object.values(index.entries).filter((e) => e.type === 'story' && e.title.startsWith(prefix))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height: 900 } })
const problems = []
for (const story of stories) {
  await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story${globals}`, { waitUntil: 'load' })
  // Story wrappers often pin a desktop width (w-120); let them shrink so only the component's own sizing shows.
  await page.addStyleTag({
    content:
      '.sb-main-centered{display:block !important} #storybook-root *:not([data-slot]):not(svg):not(path){max-width:100% !important}',
  })
  await page.waitForTimeout(500)
  const found = await page.evaluate((vw) => {
    const root = document.querySelector('#storybook-root')
    if (!root) return []
    const out = []
    const over = (el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && (r.right > vw + 1 || r.left < -1)
    }
    const doc = document.documentElement
    if (doc.scrollWidth > vw + 1) out.push(`page scrolls sideways: ${doc.scrollWidth}px`)
    // Report the outermost overflowing elements only: their children overflow with them.
    for (const el of root.querySelectorAll('*')) {
      if (!over(el) || el.closest('.sr-only')) continue
      // Progress bars slide their fill with a transform and animated pings overflow by design.
      if (el.dataset.slot === 'progress-indicator' || el.classList.contains('animate-ping')) continue
      if (el.parentElement && el.parentElement !== root && over(el.parentElement)) continue
      const r = el.getBoundingClientRect()
      const parent = el.parentElement
      const clipped = parent && getComputedStyle(parent).overflowX !== 'visible'
      out.push(
        `${el.tagName.toLowerCase()}${el.dataset.slot ? `[${el.dataset.slot}]` : ''} ${Math.round(r.left)}→${Math.round(r.right)}${clipped ? ' (clipped)' : ''} .${String(el.className).slice(0, 90)}`,
      )
      if (out.length > 3) break
    }
    return out
  }, width)
  if (found.length) problems.push({ id: story.id, found })
}
await browser.close()
for (const p of problems) console.log(`${p.id}\n  ${p.found.join('\n  ')}`)
console.log(`\n${stories.length} stories, ${problems.length} with problems at ${width}px`)
