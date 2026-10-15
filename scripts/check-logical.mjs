// RTL guard (run by `pnpm lint`): components use logical CSS properties (ms-/me-/ps-/pe-/start-/end-/
// text-start/rounded-s/border-s…), never the physical left/right ones, so they mirror in right-to-left text.
// Centering (left-1/2 with a translate) and Radix `data-[side=left]` are physical on purpose and not matched.
import { globSync, readFileSync } from 'node:fs'

const PHYSICAL =
  /(?<![\w-])-?(?:ml|mr|pl|pr)-|(?<![\w-])-?(?:left|right)-(?!1\/2\b)(?=\d|px\b|\(|\[|full\b)|(?<![\w-])text-(?:left|right)\b|(?<![\w-])(?:rounded|border)-(?:l|r|tl|tr|bl|br)(?=-|\b)/g
const files = globSync('src/**/*.tsx').filter((file) => !file.endsWith('.stories.tsx'))
const problems = []
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      if (line.trim().startsWith('//') || line.includes('rtl-ok')) return
      for (const match of line.matchAll(PHYSICAL)) problems.push(`${file}:${index + 1}: ${match[0]}`)
    })
}
if (problems.length) {
  console.error(
    `Logical properties only (ms/me/ps/pe/start/end/text-start/rounded-s…), see docs/i18n-rtl.md:\n  ${problems.join('\n  ')}`,
  )
  process.exit(1)
}
console.log(`Logical properties: ${files.length} component files OK`)
