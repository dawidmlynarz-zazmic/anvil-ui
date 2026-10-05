import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { ContentBlocks, ContentMath } from './content-blocks'

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
