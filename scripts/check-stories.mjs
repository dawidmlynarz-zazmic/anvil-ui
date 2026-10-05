// Story standards check (run by `pnpm lint`). Every component meta must have a title, exactly one
// tier tag (.storybook/tiers.ts), parameters.layout and a Figma link (parameters.design), and no
// story may use `play` (interactions are Story.test). Welcome is the landing page and is exempt.
import { globSync, readFileSync } from 'node:fs'

const TIER_TAGS = ['ui-component', 'agent-primitive', 'agent-block', 'agent-template']
const files = [...globSync('src/**/*.stories.tsx'), ...globSync('stories/**/*.stories.tsx')].sort()
const problems = []

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const title = source.match(/^ {2}title: '([^']+)'/m)?.[1]
  if (!title) {
    problems.push(`${file}: no title in preview.meta`)
    continue
  }
  if (title === 'Welcome') continue
  const tags = [...(source.match(/^ {2}tags: \[([^\]]*)\]/m)?.[1].matchAll(/'([^']+)'/g) ?? [])].map(
    (m) => m[1],
  )
  const tiers = tags.filter((tag) => TIER_TAGS.includes(tag))
  if (tiers.length !== 1)
    problems.push(`${file}: needs exactly one tier tag (${TIER_TAGS.join(' · ')}), has ${tiers.length}`)
  if (!/\blayout: '/.test(source)) problems.push(`${file}: no parameters.layout`)
  if (!/design: \{ type: 'figma'/.test(source)) problems.push(`${file}: no parameters.design (Figma link)`)
  if (/^\s+play:/m.test(source)) problems.push(`${file}: uses play (use Story.test instead)`)
}

if (problems.length) {
  console.error(`Story standards: ${problems.length} problem(s)\n${problems.map((p) => `  ${p}`).join('\n')}`)
  process.exit(1)
}
console.log(`Story standards: ${files.length} story files OK`)
