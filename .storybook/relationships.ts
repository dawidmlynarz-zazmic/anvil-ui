// Which Anvil components a component is built with, and where it is used: read from the imports
// of src/components at build time, so the docs pages never drift from the code. A file without a
// story of its own (an internal helper such as Citation Confidence or the menu styles) is looked
// through: its imports count as the importer's.

const sources = import.meta.glob<string>('/src/components/*/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** `/src/components/ui/button.tsx` → `ui/button`. */
const stemOf = (path: string) => path.replace('/src/components/', '').replace(/\.tsx$/, '')

const titles = new Map<string, string>()
const imports = new Map<string, string[]>()

for (const [path, source] of Object.entries(sources)) {
  if (path.endsWith('.stories.tsx')) {
    const title = source.match(/^ {2}title: '([^']+)'/m)?.[1]
    if (title) titles.set(stemOf(path).replace(/\.stories$/, ''), title)
    continue
  }
  const stem = stemOf(path)
  const folder = stem.split('/')[0]
  const found = [
    ...[...source.matchAll(/from '@\/components\/([\w-]+\/[\w-]+)'/g)].map((m) => m[1]),
    ...[...source.matchAll(/from '\.\/([\w-]+)'/g)].map((m) => `${folder}/${m[1]}`),
  ]
  imports.set(
    stem,
    [...new Set(found)].filter((dep) => dep !== stem && dep !== 'ui/icon'),
  )
}

/** The components a file is built with, looking through files that have no story. */
function builtWith(stem: string, seen = new Set<string>()): string[] {
  const out: string[] = []
  for (const dep of imports.get(stem) ?? []) {
    if (seen.has(dep)) continue
    seen.add(dep)
    if (titles.has(dep)) out.push(dep)
    else out.push(...builtWith(dep, seen))
  }
  return out
}

const stemByTitle = new Map([...titles].map(([stem, title]) => [title, stem]))

/** Built with (children) and Used in (parents) for a story title, as story titles A–Z. */
export function relationshipsOf(title: string): { builtWith: string[]; usedIn: string[] } {
  const stem = stemByTitle.get(title)
  if (!stem) return { builtWith: [], usedIn: [] }
  const children = [...new Set(builtWith(stem))].map((dep) => titles.get(dep)!)
  const parents = [...titles.keys()]
    .filter((other) => other !== stem && builtWith(other).includes(stem))
    .map((other) => titles.get(other)!)
  const byName = (a: string, b: string) => a.split('/').at(-1)!.localeCompare(b.split('/').at(-1)!)
  return { builtWith: [...new Set(children)].sort(byName), usedIn: [...new Set(parents)].sort(byName) }
}

/** Storybook's docs id for a title: `Agent Builder/Citation Drawer` → `agent-builder-citation-drawer--docs`. */
export const docsIdOf = (title: string) =>
  `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}--docs`
