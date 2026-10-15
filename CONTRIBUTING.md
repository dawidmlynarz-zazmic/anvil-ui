# Contributing to Anvil UI

Anvil UI is Zazmic's design system for conversational AI agents. This is the human version of the working
agreement in [`CLAUDE.md`](CLAUDE.md) (which Claude Code follows); both say the same thing.

## Ground rules

- **Figma is the source of truth for design; [`docs/api-contract.md`](docs/api-contract.md) is the source of
  truth for names.** If they disagree, the contract wins and the mismatch is flagged.
- **Where code is ahead of Figma, code wins and Figma gets a flag.** Behaviour, motion, copy and the
  Showroom are not drawn in Figma. When code deliberately differs from a frame (for example a contrast fix),
  record it in [`docs/component-status.md`](docs/component-status.md) and tell the design lead so Figma can
  follow. Never reconstruct token values from screenshots; tokens come from Figma only.
- **Reuse first.** Check the Welcome catalog, `src/components/{ui,anvil,agent}` and `docs/system-audit.md` before
  building. Extend an existing component with a variant or prop rather than adding a near-copy, and never
  re-draw a raw `<button>`, `<textarea>`, badge or tile.
- **shadcn is the foundation.** Start from the unmodified `shadcn add` output (its own commit), then restyle.
  List any behaviour change under "Intentional deviations from shadcn" in the status doc.
- **Ask before** adding a dependency, changing the folder structure or renaming a public prop.
- Never edit `tokens/` or `src/styles/tokens/` by hand: re-pull from Figma and run `pnpm tokens:build`.

## Setup

```bash
pnpm install
pnpm storybook         # http://localhost:6006 (restart it after adding new component files)
```

Node 24 (`.nvmrc`) and pnpm. Pin exact versions when installing.

## Making a change

1. One component (or one tightly related group) per branch and pull request. Keep diffs small.
2. Follow the per-component workflow in `CLAUDE.md`: read the Figma page, write the component with contract
   names and token utilities only, then the stories (Default with Controls, variants, states, usage guide,
   `figmaProps`, a `Story.test` for each interaction).
3. Compare against the Figma screenshot in light and dark. Check narrow widths with `pnpm audit:narrow`.
4. Run everything CI runs:

   ```bash
   pnpm typecheck && pnpm lint && pnpm test-unit && pnpm test-storybook
   ```

5. Update `docs/component-status.md` (and the Welcome catalog for a new component), then open a pull request.
   CI must be green. Stacked pull requests merge in order with merge commits; retarget the next one to `main`
   before deleting the merged branch.

## Pull request checklist

The template asks for: reuse checked, Figma compared (light and dark), narrow widths checked, accessibility
(keyboard, focus, names) considered, tests added, status doc updated, and any Figma flag raised.

## Reporting problems

Use the issue templates: a **bug** (what you saw, which story, which theme and width) or a **component
request** (the job it does, where it is used, whether Figma already draws it).
