# Anvil UI

Anvil UI is Zazmic's design system for conversational AI agents. It turns the **Zazmic Anvil UI
Kit** Figma file into accessible React components, documented and tested in Storybook.

**Author:** Dawid Młynarz

## What we're building

- **Foundations:** colors, typography, spacing, radius, elevation and icons. All of them are pulled
  from the Figma variables and styles, never invented in code.
- **Components:** the full set of UI building blocks: actions, forms, overlays, feedback,
  navigation, and layout and data. Each one is a [shadcn/ui](https://ui.shadcn.com) component
  (Radix behavior), restyled to the Figma design.
- **Agent Builder:** patterns for conversational products, such as messages, attachments, markers
  and the surfaces an agent lives in (full screen, side panel, popover and mobile).
- **Storybook:** the living documentation. Every component has stories, Controls for its props and
  interaction states, a link to its Figma frame, and interaction and accessibility tests in light
  and dark themes.

Open the **Welcome** page in Storybook to see every area, along with what's ready and what's
planned.

## Principles

- **Figma is the source of truth for design.** [`docs/api-contract.md`](docs/api-contract.md) is
  the source of truth for names: `variant`, `intent`, `tone`, `size` and so on.
- **shadcn/ui is the foundation.** Anvil keeps shadcn's behavior (focus, keyboard, dismissal) and
  changes only the styling. Any intentional deviation is listed in
  [`docs/component-status.md`](docs/component-status.md).
- **Accessible by default.** Every story is checked with axe in both themes.
- **Lucide icons through one `Icon` component** give a consistent size and stroke everywhere.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui (Radix) · Storybook 10 · Vitest
(browser mode) · Style Dictionary · pnpm

## Getting started

Requires Node 24 (see `.nvmrc`) and pnpm.

```bash
pnpm install
pnpm storybook         # http://localhost:6006
```

| Command | What it does |
| --- | --- |
| `pnpm storybook` | Storybook dev server |
| `pnpm build-storybook` | Static Storybook in `storybook-static/` |
| `pnpm test-storybook` | Interaction and a11y tests for every story, light and dark |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint and Prettier check |
| `pnpm tokens:build` | Regenerates the CSS tokens and foundation pages from `tokens/anvil.tokens.json` |

## Repository layout

```text
.storybook/        Storybook config: themes, shell and motion toolbars, State and open controls
tokens/            anvil.tokens.json, pulled from Figma (never edited by hand)
scripts/           Figma token export and build scripts
src/styles/        globals.css and the generated token CSS
src/components/ui/ shadcn components restyled to Anvil, each with its stories
src/components/anvil/  Anvil compositions (shell header and footer, …)
stories/           Welcome page and Foundations docs
docs/              API contract, roadmap, component status
```

## Status

The project currently runs locally only. See [`docs/roadmap.md`](docs/roadmap.md) for the plan
and [`docs/component-status.md`](docs/component-status.md) for the state of each component.
Contributors and Claude Code follow the working agreements in [`CLAUDE.md`](CLAUDE.md).

## Links

- Figma: [Zazmic Anvil UI Kit](https://www.figma.com/design/2170cRKZD9nhz325op4rL1/)

© Zazmic. Created by Dawid Młynarz.
