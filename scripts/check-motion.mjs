// Motion consistency check (run by `pnpm lint`; docs/motion-foundations.md). In every component file:
// - a `transition` / `transition-<props>` utility needs a duration token (`duration-(--duration-*)`) and
//   an `ease-*` in the same class string (Tailwind's defaults are 150ms and the browser's `ease`);
// - no `transition-all` (it animates every property: list them), no numeric `duration-<ms>` or
//   `ease-[…]` (use the tokens), no `scale` on press (`active:scale-*`: pressed is a colour, not a squash).
// `transition-none` and `motion-reduce:` overrides are fine. A string that is only a `transition-…` fragment of a longer class list
// can be exempted by putting `motion-ok` in a comment on the same line.
import { globSync, readFileSync } from 'node:fs'

const files = globSync('src/components/**/*.tsx')
  .filter((f) => !f.includes('.stories.'))
  .sort()
const problems = []

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (/^\s*\/\//.test(line) || line.includes('motion-ok')) return
    // Every quoted string on the line is a class list candidate.
    for (const [, , text] of line.matchAll(/(['"`])((?:(?!\1).)*)\1/g)) {
      const classes = text.split(/\s+/)
      const at = `${file}:${i + 1}`
      if (classes.includes('transition-all')) problems.push(`${at}: transition-all (name the properties)`)
      for (const c of classes) {
        if (/^(?:[\w-]+:)*duration-\d+$/.test(c))
          problems.push(`${at}: ${c} (use duration-(--duration-fast|base|slow))`)
        if (/^(?:[\w-]+:)*ease-\[/.test(c)) problems.push(`${at}: ${c} (use ease-out / ease-in-out)`)
        if (/^(?:[\w-]+:)*active:scale-/.test(c) || /(?:^|:)active:scale-/.test(c))
          problems.push(`${at}: ${c} (pressed is a colour, not a scale)`)
      }
      const moving = classes.filter(
        (c) =>
          !c.startsWith('motion-reduce:') &&
          /^(?:[\w[\]=()&>*-]+:)*transition(?:-(?!none)[\w[\],-]+)?$/.test(c),
      )
      if (moving.length) {
        const hasDuration = classes.some((c) => /(?:^|:)duration-\(--duration-\w+\)$/.test(c))
        const hasEase = classes.some((c) => /(?:^|:)ease-(?:out|in-out|linear|in)$/.test(c))
        if (!hasDuration || !hasEase)
          problems.push(
            `${at}: ${moving[0]} without ${[!hasDuration && 'a duration token', !hasEase && 'an ease'].filter(Boolean).join(' or ')}`,
          )
      }
    }
  })
}

if (problems.length) {
  console.error(`Motion check: ${problems.length} problem(s)\n${problems.map((p) => `  ${p}`).join('\n')}`)
  process.exit(1)
}
console.log(`Motion check: ${files.length} component files OK`)
