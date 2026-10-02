# Kickoff prompt for Claude Code

Paste the block below as your first message, in Plan Mode (Shift+Tab until it says "plan mode").
Later sessions only need a short prompt such as "Continue the roadmap from docs/component-status.md".

---

```text
We're starting the Anvil UI repo: Zazmic's design system for conversational AI agents,
implemented with shadcn/ui (Radix) + Tailwind CSS v4 and documented in Storybook.
Everything is local for now — no hosting or publishing.

Read these first, fully:
1. CLAUDE.md — project rules, Figma page map, token and API rules.
2. docs/api-contract.md — the naming source of truth.
3. docs/roadmap.md — the steps and checkpoints.

Then verify the Figma MCP works: call get_metadata on fileKey 2170cRKZD9nhz325op4rL1,
node 10925:2 (API Contract page), and get_screenshot of node 8208:12587 (Button page).
If the Figma tools aren't available, stop and tell me.

Then give me a plan for Step 1 (scaffold) and Step 2 (tokens) only:
- the exact packages and versions you intend to install,
- the files you'll create,
- anything in CLAUDE.md that is ambiguous or that you disagree with.

Don't write code until I approve the plan. After approval, do Step 1, then stop at its
checkpoint and show me how to run Storybook. Step 2 needs tokens/anvil.tokens.json — if it isn't
there, tell me and wait.
```

---

## Prompts for the next checkpoints

**After Step 2 is approved:**

```text
Build Button as the reference component (roadmap Step 3). Read the Button page in Figma
(node 8208:12587) and its description, follow the per-component workflow in CLAUDE.md, and
compare your stories with get_screenshot in light and dark. Stop when it's ready for review.
```

**Scaling out (repeat):**

```text
Next batch from roadmap Step 4: Badge, Label, Input. Same workflow as Button. Update
docs/component-status.md and stop for review after the batch.
```

**When Figma changes:**

```text
I re-exported tokens/anvil.tokens.json and updated the API Contract in Figma. Re-run
pnpm tokens:build, diff the generated CSS, re-export docs/api-contract.md from Figma node
10925:2, and list every component affected.
```
