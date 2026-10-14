import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { CodeBlock } from './code-block'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10671-2535'

const PAYLOAD = `{
  "tool": "search_catalog",
  "query": "daypack 28L",
  "filters": { "waterproof": true, "maxPrice": 150 }
}`

const meta = preview.meta({
  title: 'Design System/Molecules/Code Block',
  tags: ['molecule'],
  component: CodeBlock,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'size',
        values: 'compact · default',
        code: '`size` prop (default adds the language header and Copy)',
      },
      {
        property: 'theme',
        values: 'default · terminal · terminal error',
        code: '`theme` prop: default · terminal · terminal-error',
      },
    ],
    guide: {
      use: [
        'Tool arguments and results, API payloads, commands and their output, short snippets.',
        'Default size with a `language` when the user may copy it; compact for a short line beside other content.',
        '`terminal` for a command or query, `terminal-error` for its failure output.',
      ],
      avoid: [
        'Markdown code inside a message: Content Block styles it for you.',
        'A whole file or a diff the user edits: use Artifact Panel or Document Canvas.',
        'Long logs with filtering: link to the log instead.',
      ],
      content: [
        '`language` is a lowercase name (“json”, “bash”, “sql”).',
        'Show the code as it will be used: real values, no placeholder prose.',
      ],
      a11y: [
        'The code is a focusable `<pre>`, so keyboard users can scroll long lines.',
        'Copy is a labelled icon button (“Copy code”, then “Copied”) and the result is announced politely.',
      ],
    },
    docs: {
      description: {
        component:
          'A monospace code viewer (`@/components/anvil/code-block`, Figma Code block): `code` in a focusable `<pre>`, `size` compact · default (adds a `language` header and a Copy button) and `theme` default · terminal · terminal-error. Built on Button; shadcn has no primitive for it.',
      },
    },
  },
  args: {
    code: PAYLOAD,
    language: 'json',
    size: 'default' as const,
    theme: 'default' as const,
    onCopy: fn(),
  },
  argTypes: {
    code: { control: 'text' },
    language: { control: 'text' },
    size: { control: 'inline-radio', options: ['compact', 'default'] },
    theme: { control: 'inline-radio', options: ['default', 'terminal', 'terminal-error'] },
    copyLabel: { control: 'text' },
    copiedLabel: { control: 'text' },
    onCopy: { control: false, table: { category: 'Events' } },
  },
  decorators: [
    (Story) => (
      <div className="w-120 max-w-full">
        <Story />
      </div>
    ),
  ],
})

export const Default = meta.story()

Default.test('copies the code and says so', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Copy code' }))
  await expect(args.onCopy).toHaveBeenCalledWith(PAYLOAD)
  await expect(canvas.getByRole('button', { name: 'Copied' })).toBeVisible()
})

/** Figma size × theme. */
export const Variants = meta.story({
  decorators: [],
  render: () => (
    <div className="grid w-240 grid-cols-2 gap-4">
      {(['default', 'terminal', 'terminal-error'] as const).map((theme) => (
        <CodeBlock
          key={`compact-${theme}`}
          size="compact"
          theme={theme}
          code={theme === 'default' ? '{ }' : '$ npm run build'}
        />
      ))}
      {(['default', 'terminal', 'terminal-error'] as const).map((theme) => (
        <CodeBlock
          key={`header-${theme}`}
          size="default"
          theme={theme}
          language={theme === 'default' ? 'json' : 'bash'}
          code={
            theme === 'terminal-error'
              ? 'Error: build failed (exit 1)'
              : theme === 'terminal'
                ? '$ npm run build'
                : '{ }'
          }
        />
      ))}
    </div>
  ),
})

/** Long lines scroll sideways; the block is a tab stop so the keyboard can scroll it. */
export const LongLines = meta.story({
  args: {
    code: 'curl -X POST https://api.northwind.example/v1/sync/jobs -H "Authorization: Bearer $TOKEN" -d \'{"project":"q3-launch-plan","notify":true}\'',
    language: 'bash',
    theme: 'terminal',
  },
})

LongLines.test('the code block can be focused to scroll', async ({ canvasElement }) => {
  const body = canvasElement.querySelector('[data-slot=code-block-body]') as HTMLElement
  await userEvent.tab()
  await userEvent.tab()
  await expect(body).toHaveFocus()
})
