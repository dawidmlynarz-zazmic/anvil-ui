# Anvil Playground — concept v3 (MVP first, built to grow)

Status: **proposal, nothing built.** Replaces v1 (matching Figma) and v2 (a separate showroom app). This
version follows the review: it lives **inside Storybook**, you can **chat with a scripted assistant**, you
can **switch device, theme and chat shell**, and it starts as a small **MVP** that grows by adding files.

The aim is to show what the design system can do: one design system, any agent, any surface, any brand.
Scope as in `docs/roadmap.md`: local development, no hosting.

## 1. Where it lives: inside Storybook

A top-level sidebar section **Playground** (after Welcome), with full-canvas stories
(`layout: 'fullscreen'`). Reasons: one place to start, the components and docs are one click away
(“open in Storybook” from any part), no second app to run, and the existing toolbars (theme, motion) apply.

Because a playground needs controls that must be part of the experience, the **Playground has its own top
bar** (device, theme, shell, reset) rather than relying only on Storybook's toolbar. That also means it
works when opened on its own: any story can be opened full-window with Storybook's iframe URL
(`iframe.html?id=playground--assistant`), which is how it would be shown in a demo. The theme switch sets
the same `.dark` class on `<html>` that Storybook's toolbar sets, so the two stay in step.

## 2. Chatting with the assistant

You type to a **scripted assistant**. No model, no network: a small, readable “brain” maps what you
say to a flow.

- **Free text**: intents are keyword or pattern matches (“book”, “research”, “where is my order”,
  “talk to a person”), each pointing at a flow. If nothing matches, the assistant says what it can do in
  this demo and offers those as Quick Reply chips, so you never hit a dead end.
- **Starter prompts**: the Welcome State shows the available flows as Starter Prompt Cards.
- **Actions menu (⌘K)**: the Command Palette lists the triggers (“Plan a research task”, “Order a daypack”,
  “Hand off to a person”, “Show the budget warning”), so a demo can jump straight to a moment.
- **Flows are interactive**, not recordings. A flow is a script that can **wait for you**: it shows a Task
  Plan and stops until you press Approve (continues), Edit (asks what to change) or type something.
  Widgets call back into the flow, so Approve, Pause, Stop, Accept and Undo really do something.
- **Reset** returns to a clean thread; each flow can be replayed.

## 3. Switches: device, theme, shell

A top bar with three groups, remembered in the URL hash and in local storage:

| Control | Options | Effect |
| --- | --- | --- |
| **Device** | Desktop · Mobile | Frames the app in a laptop-width window or a phone-sized frame (real width, so container queries and the mobile shell tokens apply) |
| **Theme** | Light · Dark (and system) | Toggles `.dark`; the host mock follows too |
| **Chat shell** | Full screen · Side panel · Popover (launcher) · Mobile sheet | Switches the real Chat Shell surface, with the conversation kept |
| **Motion** | On · Reduced | Same switch as Storybook's Motion toolbar |

Shell and device are linked sensibly: on Mobile the shell is the mobile sheet, on Desktop you choose
between full screen, side panel and popover. Side panel and popover show a **mock host app** behind the
assistant (a simple product page), so “assistant in your product” is visible; full screen is standalone.

## 4. MVP: small, working, impressive

What the first release contains, and no more:

1. **The Playground story** with the top bar above and the Chat Shell in all four shells.
2. **A working composer**: type, press Enter, the assistant answers from the brain.
3. **Three flows**, chosen to show different strengths:
   - *Research task*: question set → brief (approve) → plan (approve) → progress → summary
     (the Tasks group).
   - *Daypack order*: offer → approval → tracker (cards, price, order tracking).
   - *Handoff to a person* (support): a short exchange that escalates (Trust group lite, built from the
     parts that exist: Alert, Timeline, Item).
4. **The Actions menu (⌘K)** and starter prompts.
5. **Tests**: each flow plays to the end through scripted user actions, with no axe violations or console
   errors; the shells and themes render.
6. **Docs**: a short “Add a flow” guide in the Playground story.

Roughly three PRs: *engine and interactive flows (Welcome demo moved onto it)* · *the Playground story:
top bar, shells, composer, brain, first two flows* · *third flow, ⌘K menu, tests, guide*.

## 5. Built to grow: everything is a registry

`src/playground/` is organised so each new thing is **one file and one line**:

```
src/playground/
  engine/        the script language and player (extracted from the Welcome chat demo)
  flows/         one file per flow (research.ts, order.ts, handoff.ts …)  → flows/index.ts registry
  intents.ts     phrases → flow
  widgets/       one case per widget kind: maps a script step to a real component
  hosts/         mock host apps (product page, booking site …)          → hosts/index.ts registry
  frames/        device frames and shell frames
  themes/        theme presets (later)
```

Adding a flow never touches the player; adding a widget never touches the flows. A growth path that
needs no rewrite:

| Version | Adds |
| --- | --- |
| **MVP** | what is in section 4 |
| **v0.2** | The agent on your page: a booking-site host with the In-page assist components wired in (Selection Toolbar, ⌘K parsing, Announcement Bar, Proactive Drawer, Element Spotlight, Co-browse Bar) |
| **v0.3** | More flows as the Catalog, Checkout and Trust groups land (travel booking, e-commerce, identity check, financial review, workspace, ticketing, HR onboarding) |
| **v0.4** | **X-ray**: hover any part for its name, level and “built with” tree (the data the docs already generate) |
| **v0.5** | **Accessibility view**: a live “what a screen reader hears” panel and a keyboard-focus path; **injectors** for streaming, offline, error, empty and very long text |
| **v0.6** | **Brand lab**: accent, radius and density presets applied through CSS variables (preview only) |
| **v0.7** | **Presentation mode and guided tour**: full-screen, arrow keys, auto-advance, short captions |
| **Later** | A Composer (drop components into a thread, export a link or TSX), built on the same engine |

## 6. How it is built

- No new dependencies; plain React, the existing components, Storybook's story format.
- The Welcome page's chat demo becomes the first user of the extracted engine (it keeps working).
- The brain is deliberately simple (patterns, not NLP) so anyone can read and extend it.
- Surfaces are real: Chat Shell, Sheet, the Launcher popover and Drawer with `data-shell` tokens, so each
  shell and size is the real thing.
- Every flow has a smoke test, so a growing library cannot rot.

## 7. Out of scope (for now)

Hosting or auth; real model calls; saving to a server; editing the real tokens; a drag-and-drop builder.

## 8. Decisions needed

1. **Name**: “Playground” (used above) or “Showroom”?
2. **MVP flows**: research, daypack order and handoff, or swap one (for example a travel booking)?
3. **Host mock** in the MVP: a simple product page behind the side panel and popover (proposed), or leave
   the host for v0.2?
4. **Phone frame**: a plain responsive frame at phone width (proposed) or a device bezel look?
