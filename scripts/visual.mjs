// Visual regression: screenshots a curated list of stories (visual/stories.json) in light and dark and
// compares them with the committed baselines in visual/baselines/.
//
//   pnpm build-storybook && node scripts/visual.mjs            compare (what CI runs)
//   node scripts/visual.mjs --update                            write the baselines
//   node scripts/visual.mjs --url http://localhost:6006         use a running Storybook instead of the build
//
// Fonts and anti-aliasing differ per operating system, so baselines are made and compared on Linux (CI).
// Run the "Visual baselines" workflow to update them; other platforms refuse to compare unless --any-platform.
// No dependencies beyond Playwright: the pixel comparison runs in the browser on a canvas.
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const update = args.includes('--update')
const anyPlatform = args.includes('--any-platform')
const urlArg = args.includes('--url') ? args[args.indexOf('--url') + 1] : undefined
const config = JSON.parse(readFileSync('visual/stories.json', 'utf8'))
const baselines = 'visual/baselines'
const diffs = 'visual/diffs'
// A pixel differs when any channel moves by more than this; a screenshot fails above this share of pixels.
const CHANNEL = 12
const FAIL_RATIO = 0.002

if (process.platform !== 'linux' && !anyPlatform) {
  console.log(
    `Visual baselines are Linux renders; this is ${process.platform}. Use the "Visual baselines" workflow, or --any-platform to try anyway.`,
  )
  process.exit(0)
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}
let server
let base = urlArg
if (!base) {
  const root = 'storybook-static'
  if (!existsSync(root)) {
    console.error('storybook-static not found: run pnpm build-storybook first (or pass --url).')
    process.exit(2)
  }
  server = createServer((req, res) => {
    const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '')
    let file = join(root, path)
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!existsSync(file)) {
      res.writeHead(404).end('not found')
      return
    }
    res
      .writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
      .end(readFileSync(file))
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${server.address().port}`
}

mkdirSync(baselines, { recursive: true })
mkdirSync(diffs, { recursive: true })
const browser = await chromium.launch()
const failures = []
let compared = 0
let written = 0

for (const theme of config.themes) {
  const context = await browser.newContext({
    viewport: config.viewport,
    reducedMotion: 'reduce',
    colorScheme: theme,
  })
  const page = await context.newPage()
  for (const id of config.stories) {
    await page.goto(`${base}/iframe.html?id=${id}&viewMode=story&globals=motion:off;theme:${theme}`, {
      waitUntil: 'load',
    })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForSelector('#storybook-root > *', { timeout: 15000 })
    await page.waitForTimeout(500)
    const shot = await page.locator('#storybook-root').screenshot({ animations: 'disabled' })
    const file = `${baselines}/${id}.${theme}.png`
    if (update || !existsSync(file)) {
      writeFileSync(file, shot)
      written += 1
      continue
    }
    compared += 1
    const result = await page.evaluate(
      async ({ a, b, channel }) => {
        const load = (data) =>
          new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = reject
            image.src = `data:image/png;base64,${data}`
          })
        const [one, two] = await Promise.all([load(a), load(b)])
        const width = Math.max(one.width, two.width)
        const height = Math.max(one.height, two.height)
        const draw = (image) => {
          const canvas = new OffscreenCanvas(width, height)
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          ctx.drawImage(image, 0, 0)
          return ctx.getImageData(0, 0, width, height)
        }
        const left = draw(one)
        const right = draw(two)
        const out = new OffscreenCanvas(width, height)
        const octx = out.getContext('2d')
        const diff = octx.createImageData(width, height)
        let different = 0
        for (let i = 0; i < left.data.length; i += 4) {
          const delta = Math.max(
            Math.abs(left.data[i] - right.data[i]),
            Math.abs(left.data[i + 1] - right.data[i + 1]),
            Math.abs(left.data[i + 2] - right.data[i + 2]),
          )
          const changed = delta > channel
          if (changed) different += 1
          diff.data[i] = changed ? 255 : right.data[i]
          diff.data[i + 1] = changed ? 0 : right.data[i + 1]
          diff.data[i + 2] = changed ? 0 : right.data[i + 2]
          diff.data[i + 3] = 255
        }
        octx.putImageData(diff, 0, 0)
        const blob = await out.convertToBlob({ type: 'image/png' })
        const buffer = new Uint8Array(await blob.arrayBuffer())
        let binary = ''
        for (const byte of buffer) binary += String.fromCharCode(byte)
        return {
          ratio: different / (width * height),
          different,
          sizeChanged: one.width !== two.width || one.height !== two.height,
          diff: btoa(binary),
        }
      },
      { a: readFileSync(file).toString('base64'), b: shot.toString('base64'), channel: CHANNEL },
    )
    if (result.ratio > FAIL_RATIO || result.sizeChanged) {
      writeFileSync(`${diffs}/${id}.${theme}.diff.png`, Buffer.from(result.diff, 'base64'))
      writeFileSync(`${diffs}/${id}.${theme}.actual.png`, shot)
      failures.push(
        `${id} (${theme}): ${(result.ratio * 100).toFixed(2)}% of pixels differ${result.sizeChanged ? ', size changed' : ''}`,
      )
    }
  }
  await context.close()
}
await browser.close()
server?.close()

if (written) console.log(`Wrote ${written} baseline(s) to ${baselines}.`)
if (failures.length) {
  console.error(
    `\n${failures.length} visual difference(s); diffs are in ${diffs}/ (red = changed):\n  ${failures.join('\n  ')}`,
  )
  process.exit(1)
}
console.log(`Visual check: ${compared} screenshot(s) match their baselines.`)
