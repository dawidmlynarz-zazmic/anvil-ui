import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { ContentBlocks, ContentMath } from './content-blocks'
import { MessageRow } from './message-row'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10729-2391'

function Blocks() {
  return (
    <ContentBlocks className="max-w-(--shell-widget-max)">
      <h2>Title</h2>
      <p>
        Subtitle. Subtitle with <a href="#source">Label</a> and <code>value</code>.
      </p>
      <ul>
        <li>Label 1</li>
        <li>Label 2</li>
        <li>Label 3</li>
      </ul>
      <ol>
        <li>Label 1</li>
        <li>Label 2</li>
        <li>Label 3</li>
      </ol>
      <blockquote>
        <p>“Subtitle.”</p>
        <footer>
          <cite>Label</cite>
        </footer>
      </blockquote>
      <table>
        <thead>
          <tr>
            <th>Title 1</th>
            <th>Title 2</th>
            <th>Title 3</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((row) => (
            <tr key={row}>
              <td>Label {row}</td>
              <td>Value</td>
              <td>Value</td>
            </tr>
          ))}
        </tbody>
      </table>
      <pre>
        <code>{'const value = label.trim()\nconsole.log(value)'}</code>
      </pre>
      <ContentMath caption="Subtitle">value = a ÷ (a + b) ≈ 0.70</ContentMath>
      <hr />
    </ContentBlocks>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Messages/Content Block',
  tags: ['agent-primitive'],
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
  await expect(canvas.getByRole('heading', { name: 'Title' })).toBeVisible()
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
        <h2>Title</h2>
        <p>Subtitle</p>
        <ul>
          <li>Label 1</li>
          <li>Label 2</li>
        </ul>
        <pre>
          <code>{'const value = {\n  label: "Value",'}</code>
        </pre>
      </ContentBlocks>
    </MessageRow>
  ),
})

Streaming.test('partial blocks still render as a document', async ({ canvas }) => {
  await expect(canvas.getByRole('heading', { name: 'Title' })).toBeVisible()
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
            <th>Label 1</th>
            <th>Label 2</th>
            <th>Label 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{LONG}</td>
            <td>Value</td>
            <td>Value</td>
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
