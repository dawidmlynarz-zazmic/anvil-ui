# Using Anvil UI in another repo

Anvil UI is not published as a package yet (see `docs/roadmap.md`). Until then, an app uses it by **copying the
source** it needs, the same way shadcn/ui works: you own the copied files. This guide is for a new app, for
example a client demo kept in its own private repo.

> **Public repo warning:** this repo and its Storybook are public. Keep client work, copy and data in the
> other repo, never here.

## 1. Create the app

```bash
pnpm create vite@latest my-demo --template react-ts   # Node 24 (.nvmrc), pnpm
cd my-demo
pnpm add -D tailwindcss@4.3.3 @tailwindcss/vite@4.3.3
```

Match the Anvil stack: React 19, Vite 8, TypeScript 6.0 (strict), Tailwind CSS v4 (CSS-first, no
`tailwind.config.js`). Pin exact versions.

`vite.config.ts`: add `tailwindcss()` to `plugins` and the `@` alias (`'@': path/to/src`).
`tsconfig.app.json`: add `"paths": { "@/*": ["./src/*"] }`.

## 2. Copy what you need

From this repo, run the helper. It copies each component, everything it imports, the token CSS and the base
styles, then prints the `pnpm add` line with the versions Anvil pins:

```bash
node scripts/copy-to-app.mjs ../my-demo ui/button ui/card agent/task-card
```

A component is a path under `src/components/` without the extension (`ui/…`, `anvil/…`, `agent/…`). Browse
the live Storybook for names. Copy the printed `pnpm add …` line into the app and run it.

What lands in the app's `src/`:

| Path | What it is |
| --- | --- |
| `styles/globals.css` | Tailwind import, token imports, `focus-ring`, forced-colors rules |
| `styles/theme-reset.css` | Clears Tailwind's default palette, type scale and radii: only Anvil values exist |
| `styles/tokens/*.css` | Generated from Figma. **Never edit by hand** (see step 5) |
| `lib/utils.ts` | `cn()` |
| `components/…` | The components, with their imports |

If a component needs `lib/locale.tsx`, `lib/motion.ts` or `hooks/use-mobile.ts`, the helper copies it as an
import. Wrap the app in `LocaleProvider` (`@/lib/locale`) if you copied anything that formats dates or numbers.

## 3. Wire the app

`src/main.tsx`:

```tsx
import './styles/globals.css'
```

`index.html` `<head>`: the fonts (Anvil loads them from Google Fonts):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Funnel+Sans:wght@600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap"
/>
```

Dark mode: put the `dark` class on `<html>` (`document.documentElement.classList.toggle('dark', on)`).
Shell layouts for chat surfaces use `data-shell="full-screen | side-panel | popover | mobile"` on a wrapper.

## 4. Build with the rules Anvil follows

- **Icons:** only through `Icon` (`<Icon icon={PlusIcon} />`, from `@/components/ui/icon`), never `lucide-react`
  directly.
- **Tokens only:** utilities like `bg-agent-soft`, `text-muted-foreground`, `type-heading-2xl`,
  `shadow-elevation-raised`. Tailwind's default colours (`bg-red-500`), `text-lg` and `font-bold` do not exist
  here. Use `px` literals only for 1px borders.
- **Props:** `variant`, `intent`, `tone`, `size` as in `docs/api-contract.md`.
- **Compose, don't redraw:** use Button, Badge, Card, Alert, Empty State, Item and the shell parts instead of raw
  elements.
- **Logical CSS** (`ms-*`, `ps-*`, `text-start`) so right-to-left works.
- **Don't edit copied files** for one-off looks; wrap or pass props. If a component needs a real change, make
  it in this repo and copy it again, so every app benefits.

Good starting points to copy from: `src/showroom/` (a complete scripted agent app) and the Agent Builder
stories in Storybook.

## 5. Keeping in sync

- **Design changes:** tokens are pulled from Figma into `tokens/anvil.tokens.json` and built into
  `src/styles/tokens/*.css` here (`pnpm tokens:build`). Re-run `copy-to-app.mjs` for the same components to
  refresh the app, and review the diff.
- **Record the version:** note the Anvil commit you copied from in the app's README (`git rev-parse --short
  HEAD` in this repo) so updates are traceable.
- **Later:** the shadcn registry (`npx shadcn add @anvil/button`) and a tokens package will replace the copy
  step. They are on the roadmap, not built.

## Limits to know

- The helper copies source files only: no stories, tests or Storybook config.
- It resolves `@/…` imports; if it prints `could not resolve`, copy that file by hand.
- Checked by copying Button, Card and Task Card into a blank Vite app: it typechecks and builds. A full app with
  many components has not been tried yet. Report anything missing and we will fix the helper or this guide.
