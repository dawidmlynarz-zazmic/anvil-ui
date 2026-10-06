import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { ContentBlocks, ContentMath } from './content-blocks'
import { MessageRow } from './message-row'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10729-2391'

const METRICS = [
  ['Weekly active users', '12,480', '+8.2%'],
  ['Trial conversion', '4.6%', '−0.3 pt'],
  ['Churn', '2.1%', '0.0 pt'],
]

/** The assistant’s answer to “Summarize the Q3 launch plan”. */
function Blocks() {
  return (
    <ContentBlocks className="max-w-(--shell-widget-max)">
      <h2>Q3 launch plan</h2>
      <p>
        Northwind Sync launches on <strong>September 14</strong>. I used{' '}
        <a href="#source">q3-launch-plan.pdf</a> and the latest numbers from <code>query_database</code>.
      </p>
      <ul>
        <li>Private beta for 200 teams through August</li>
        <li>Pricing goes live on launch day</li>
        <li>Launch review with Leo, Priya and Sam on September 7</li>
      </ul>
      <ol>
        <li>Send beta invites (August 4)</li>
        <li>Close beta feedback (August 25)</li>
        <li>Publish the pricing page (September 14)</li>
      </ol>
      <blockquote>
        <p>“Sync should feel instant, even on a slow connection.”</p>
        <footer>
          <cite>Launch brief, page 2</cite>
        </footer>
      </blockquote>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>This week</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {METRICS.map(([metric, value, change]) => (
            <tr key={metric}>
              <td>{metric}</td>
              <td>{value}</td>
              <td>{change}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <pre>
        <code>
          {
            "SELECT week, active_users\nFROM weekly_metrics\nWHERE product = 'northwind-sync'\nORDER BY week DESC\nLIMIT 8;"
          }
        </code>
      </pre>
      <ContentMath caption="Trial conversion = paid ÷ trials">conversion = 574 ÷ 12,480 ≈ 4.6%</ContentMath>
      <hr />
    </ContentBlocks>
  )
}

const meta = preview.meta({
  title: 'Organisms/Content Block',
  tags: ['organism', 'messages'],
  component: ContentBlocks,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'type',
        values: 'heading · paragraph · bulleted list · numbered list · quote · table · code · math · divider',
        code: 'the HTML child: `h1`–`h4` · `p` · `ul` · `ol` · `blockquote` · `table` · `pre` · `ContentMath` · `hr`',
      },
    ],
    guide: {
      use: [
        'The body of an assistant answer: pass your Markdown renderer’s HTML (headings, lists, quotes, tables, code, dividers, links) as children.',
        '`ContentMath` to frame a rendered formula with a caption; streaming answers render half-built blocks as they arrive.',
      ],
      avoid: [
        'Large or interactive data (sorting, selection, actions): use Widget Table or Table in the Artifact Panel. Key numbers: use Widget Metric Card.',
        'Code the user will copy or run as a file: use Code Block (with copy and language). Page-level documentation: plain prose styles, not an answer.',
      ],
      content: [
        'Lead with the answer in one sentence, then structure: a short heading, bullets for facts, a numbered list for steps.',
        'Tables keep units in the headers and right numbers; quotes name their source in `<cite>` (“Launch brief, page 2”).',
      ],
      a11y: [
        'Keep real HTML semantics (`h2`, `ul`, `table` with `th`), so screen readers navigate the answer by headings, lists and tables.',
        'Give scrolling `<pre>` blocks `tabIndex={0}` so keyboard users can scroll them.',
        'Link text says where it goes (“q3-launch-plan.pdf”), never “here”.',
      ],
    },
    docs: {
      description: {
        component:
          'The blocks of an assistant answer (`@/components/agent/content-blocks`). `ContentBlocks` styles the HTML your markdown renderer outputs — headings, paragraphs, bulleted and numbered lists, quotes (with a `<footer>`/`<cite>` source), tables, code, dividers and links — to the Figma content block types; `ContentMath` frames a rendered formula with a caption. No markdown library is bundled: pass its output as children.',
      },
    },
  },
  argTypes: { children: { control: false } },
  render: () => <Blocks />,
})

/** Every Figma content block type, in order. */
export const Default = meta.story()

Default.test('keeps the document semantics', async ({ canvas }) => {
  await expect(canvas.getByRole('heading', { name: 'Q3 launch plan' })).toBeVisible()
  await expect(canvas.getAllByRole('list')).toHaveLength(2)
  await expect(canvas.getAllByRole('columnheader')).toHaveLength(3)
  await expect(canvas.getByRole('separator')).toBeInTheDocument()
})

/**
 * Mid-stream: the answer arrives token by token inside a streaming Message Row, so the renderer
 * shows a half-built list and a code block whose closing fence has not arrived yet.
 */
export const Streaming = meta.story({
  render: () => (
    <MessageRow role="assistant" status="streaming" className="max-w-(--shell-widget-max)">
      <ContentBlocks>
        <h2>Q3 launch plan</h2>
        <p>Northwind Sync launches on September 14. Here is what’s planned:</p>
        <ul>
          <li>Private beta for 200 teams through August</li>
          <li>Pricing goes live on</li>
        </ul>
        <pre>
          <code>{'SELECT week, active_users\nFROM weekly_metrics\nWHERE'}</code>
        </pre>
      </ContentBlocks>
    </MessageRow>
  ),
})

Streaming.test('partial blocks still render as a document', async ({ canvas }) => {
  await expect(canvas.getByRole('heading', { name: 'Q3 launch plan' })).toBeVisible()
  await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
})

const LONG =
  'A long subtitle that wraps onto several lines to check spacing, line length and wrapping in a narrow column.'
const UNBROKEN =
  'https://example.com/a/very/long/path/without/any/spaces/that/must/wrap/inside/the/column/value'

/** Stress test: long paragraphs, an unbroken URL, a long code line and a wide table in a narrow column. */
export const LongContent = meta.story({
  render: () => (
    <ContentBlocks className="max-w-80">
      <h2>{LONG}</h2>
      <p>
        {LONG} <a href="#source">{UNBROKEN}</a>
      </p>
      <ul>
        <li>{LONG}</li>
        <li>{UNBROKEN}</li>
      </ul>
      <pre tabIndex={0}>
        <code>{`const value = "${UNBROKEN}"`}</code>
      </pre>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Owner</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{LONG}</td>
            <td>Priya Shah</td>
            <td>Sep 7</td>
          </tr>
        </tbody>
      </table>
    </ContentBlocks>
  ),
})

LongContent.test('nothing overflows the column', async ({ canvasElement }) => {
  const blocks = canvasElement.querySelector<HTMLElement>('[data-slot=content-blocks]')!
  for (const child of blocks.querySelectorAll<HTMLElement>('h2, p, li, table')) {
    await expect(child.scrollWidth).toBeLessThanOrEqual(blocks.clientWidth + 1)
  }
})
