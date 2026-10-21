// Copies Anvil components into another app, with everything they import.
//   node scripts/copy-to-app.mjs <target-app-dir> <component> [<component> ...]
// A component is a path under src/components without the extension, e.g. ui/button or agent/task-card.
// Follows `@/` imports recursively, copies the base styles and lib files, then prints the npm packages
// (with the versions this repo pins) the copied files need. See docs/using-anvil-in-another-repo.md.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const [target, ...components] = process.argv.slice(2)
if (!target || components.length === 0) {
  console.error('Usage: node scripts/copy-to-app.mjs <target-app-dir> <ui/button> [agent/task-card ...]')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const versions = { ...pkg.dependencies, ...pkg.devDependencies }
const EXT = ['.tsx', '.ts']
const resolveSrc = (spec) => {
  const base = path.join(root, 'src', spec.slice(2))
  return (
    EXT.map((e) => base + e).find(existsSync) ??
    (existsSync(path.join(base, 'index.tsx')) ? path.join(base, 'index.tsx') : null)
  )
}

const files = new Set()
const packages = new Set()
const visit = (file) => {
  if (files.has(file)) return
  files.add(file)
  const src = readFileSync(file, 'utf8')
  for (const [, spec] of src.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    if (spec.startsWith('@/')) {
      const next = resolveSrc(spec)
      if (!next) console.warn(`! could not resolve ${spec} (imported by ${path.relative(root, file)})`)
      else visit(next)
    } else if (!spec.startsWith('.')) {
      packages.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0])
    }
  }
}

for (const c of components) {
  const file = resolveSrc(`@/components/${c}`)
  if (!file) {
    console.error(`No component at src/components/${c}`)
    process.exit(1)
  }
  visit(file)
}
// Tailwind-side files every component relies on.
const base = ['styles/globals.css', 'styles/theme-reset.css', 'lib/utils.ts']
const copy = (rel) => {
  const from = path.join(root, 'src', rel)
  const to = path.join(target, 'src', rel)
  mkdirSync(path.dirname(to), { recursive: true })
  copyFileSync(from, to)
}
base.forEach(copy)
for (const f of ['colors', 'dimensions', 'effects', 'primitives', 'shell', 'typography'])
  copy(`styles/tokens/${f}.css`)
for (const f of files) copy(path.relative(path.join(root, 'src'), f))

packages.add('clsx')
packages.add('tailwind-merge')
packages.add('tw-animate-css')
const deps = [...packages].filter((p) => p !== 'react' && p !== 'react-dom' && versions[p]).sort()
console.log(`Copied ${files.size} component files + base styles into ${path.join(target, 'src')}.\n`)
console.log('Install (exact versions pinned by Anvil):')
console.log(`  pnpm add ${deps.map((p) => `${p}@${versions[p]}`).join(' ')}`)
