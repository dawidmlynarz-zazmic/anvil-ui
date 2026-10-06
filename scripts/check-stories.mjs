// Story standards check (run by `pnpm lint`). Every component meta must have a title, exactly one
// category tag (.storybook/taxonomy.ts) that the title's section allows, parameters.layout, a Figma link
// (parameters.design), the Figma → code table (parameters.figmaProps; `[]` with a comment when
// Figma has no properties) and explicit argTypes, and no story may use `play` (interactions are
// Story.test). Welcome is exempt.
import { globSync, readFileSync } from 'node:fs'

// Mirrors .storybook/taxonomy.ts: each sidebar section and the categories it allows.
const CATEGORY_TAGS = ['element', 'composite', 'feature', 'template']
const SECTION_CATEGORIES = {
  Foundations: ['element'],
  'UI Components': ['element', 'composite', 'feature'],
  'Agent Primitives': ['element', 'composite'],
  'Agent Blocks': ['feature'],
  'Agent Templates': ['template'],
}
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
  const categories = tags.filter((tag) => CATEGORY_TAGS.includes(tag))
  if (categories.length !== 1)
    problems.push(
      `${file}: needs exactly one category tag (${CATEGORY_TAGS.join(' · ')}), has ${categories.length}`,
    )
  const section = title.split('/')[0]
  const allowed = SECTION_CATEGORIES[section]
  if (!allowed) problems.push(`${file}: unknown section ${section}`)
  else if (categories.length === 1 && !allowed.includes(categories[0]))
    problems.push(`${file}: ${section} takes ${allowed.join(' · ')}, not ${categories[0]}`)
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
