// Story standards check (run by `pnpm lint`). Every component meta must have a title, exactly one
// tier tag (.storybook/tiers.ts) matching the title's section, parameters.layout, a Figma link
// (parameters.design), the Figma → code table (parameters.figmaProps; `[]` with a comment when
// Figma has no properties) and explicit argTypes, and no story may use `play` (interactions are
// Story.test). Welcome is exempt.
import { globSync, readFileSync } from 'node:fs'

const TIER_SECTIONS = {
  'ui-component': 'UI Components',
  'agent-primitive': 'Agent Primitives',
  'agent-block': 'Agent Blocks',
  'agent-template': 'Agent Templates',
}
const TIER_TAGS = Object.keys(TIER_SECTIONS)
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
  const section = title.split('/')[0]
  if (tiers.length === 1 && section !== 'Foundations' && TIER_SECTIONS[tiers[0]] !== section)
    problems.push(
      `${file}: title is in ${section} but the tier tag is ${tiers[0]} (${TIER_SECTIONS[tiers[0]]})`,
    )
  if (!/\blayout: '/.test(source)) problems.push(`${file}: no parameters.layout`)
  if (!/design: \{ type: 'figma'/.test(source)) problems.push(`${file}: no parameters.design (Figma link)`)
  if (!/^ {4}figmaProps: \[/m.test(source))
    problems.push(`${file}: no parameters.figmaProps (Figma → code table)`)
  if (!/^ {2}argTypes: \{/m.test(source)) problems.push(`${file}: no argTypes`)
  if (/^\s+play:/m.test(source)) problems.push(`${file}: uses play (use Story.test instead)`)
}

if (problems.length) {
  console.error(`Story standards: ${problems.length} problem(s)\n${problems.map((p) => `  ${p}`).join('\n')}`)
  process.exit(1)
}
console.log(`Story standards: ${files.length} story files OK`)
