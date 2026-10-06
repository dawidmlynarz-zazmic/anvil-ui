// Story standards check (run by `pnpm lint`). Every component meta must have a title under its
// level (Atoms/<Name>, Molecules/…, Organisms/…; Agent Builder/<Group>/<Name> with a known group;
// Foundations/… for the Icon), exactly one
// level tag that matches it, only known context tags (.storybook/taxonomy.ts), a shadcn slug only
// as `parameters.shadcn: '<slug>'`, parameters.layout, a Figma link
// (parameters.design), the usage guide (parameters.guide, starting with `use`), the Figma → code table (parameters.figmaProps; `[]` with a comment when
// Figma has no properties) and explicit argTypes, and no story may use `play` (interactions are
// Story.test). Welcome is exempt.
import { globSync, readFileSync } from 'node:fs'

// Mirrors .storybook/taxonomy.ts.
const LEVELS = {
  atom: 'Atoms',
  molecule: 'Molecules',
  organism: 'Organisms',
  'agent-builder': 'Agent Builder',
}
const AGENT_BUILDER_GROUPS = [
  'Surfaces',
  'In-page assist',
  'Shell',
  'Input',
  'Messages',
  'Agent status',
  'Sources',
  'Memory',
  'Actions',
  'Widgets & artifacts',
  'Feedback',
  'Tasks',
  'Evidence & decisions',
  'Catalog & scheduling',
  'Checkout & orders',
  'Trust & handoff',
]
const CONTEXTS = ['messages', 'input', 'agent-status', 'sources', 'memory', 'actions', 'widgets', 'feedback']
const RETIRED = ['element', 'composite', 'feature', 'template', 'anvil-custom']
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
  const levels = tags.filter((tag) => tag in LEVELS)
  if (levels.length !== 1)
    problems.push(
      `${file}: needs exactly one level tag (${Object.keys(LEVELS).join(' · ')}), has ${levels.length}`,
    )
  const section = title.split('/')[0]
  const expected = section === 'Foundations' ? 'Foundations' : LEVELS[levels[0]]
  if (levels.length === 1 && section !== expected && !(section === 'Foundations' && levels[0] === 'atom'))
    problems.push(`${file}: a ${levels[0]} lives under ${LEVELS[levels[0]]}/, not ${section}/`)
  const parts = title.split('/')
  if (section === 'Agent Builder') {
    if (parts.length !== 3 || !AGENT_BUILDER_GROUPS.includes(parts[1]))
      problems.push(
        `${file}: Agent Builder titles are 'Agent Builder/<Group>/<Name>' (groups: ${AGENT_BUILDER_GROUPS.join(' · ')})`,
      )
  } else if (section !== 'Foundations' && parts.length !== 2)
    problems.push(`${file}: ${section} titles are '${section}/<Name>' (no folders)`)
  for (const tag of tags) {
    if (RETIRED.includes(tag)) problems.push(`${file}: retired tag '${tag}'`)
    else if (!(tag in LEVELS) && !CONTEXTS.includes(tag) && tag !== '!autodocs')
      problems.push(`${file}: unknown tag '${tag}' (contexts: ${CONTEXTS.join(' · ')})`)
  }
  if (!/\blayout: '/.test(source)) problems.push(`${file}: no parameters.layout`)
  if (!/design: \{ type: 'figma'/.test(source)) problems.push(`${file}: no parameters.design (Figma link)`)
  if (!/^ {4}figmaProps: \[/m.test(source))
    problems.push(`${file}: no parameters.figmaProps (Figma → code table)`)
  if (!/^ {2}argTypes: \{/m.test(source)) problems.push(`${file}: no argTypes`)
  if (section !== 'Foundations' && !/^ {4}guide: \{\n {6}use: \[/m.test(source))
    problems.push(`${file}: no parameters.guide (Usage: use, avoid, content, a11y)`)
  if (/^\s+play:/m.test(source)) problems.push(`${file}: uses play (use Story.test instead)`)
}

if (problems.length) {
  console.error(`Story standards: ${problems.length} problem(s)\n${problems.map((p) => `  ${p}`).join('\n')}`)
  process.exit(1)
}
console.log(`Story standards: ${files.length} story files OK`)
