import type { ReactNode } from 'react'
import { Controls, Description, Primary, Stories, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks'

import { categoryOf, CUSTOM_TAG, type FigmaProp } from './taxonomy'

// Docs page for every component (autodocs): title, category badge and Figma link, the description,
// the primary story with its controls, the Figma → code table, then every story.

/** Renders `code` spans from backticks. */
function inlineCode(text: string): ReactNode[] {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))
}

/** The component's prepared meta (tags, parameters). */
function usePreparedMeta() {
  const resolved = useOf('meta')
  return resolved.type === 'meta' ? resolved.preparedMeta : undefined
}

function Meta() {
  const preparedMeta = usePreparedMeta()
  if (!preparedMeta) return null
  const category = categoryOf(preparedMeta.tags)
  const custom = preparedMeta.tags.includes(CUSTOM_TAG)
  const figmaUrl = (preparedMeta.parameters.design as { url?: string } | undefined)?.url
  if (!category && !figmaUrl) return null
  return (
    <div className="sb-unstyled not-prose mb-6 flex flex-wrap items-center gap-2 type-text-xs-medium">
      {category && (
        <span
          title={category.description}
          className="inline-flex items-center gap-1 rounded-full bg-agent-subtle px-2 py-0.5 text-agent-strong"
        >
          {category.label}
        </span>
      )}
      {custom && (
        <span
          title="No shadcn/ui counterpart: built for Anvil, outside the shadcn sync."
          className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-foreground"
        >
          Anvil-only
        </span>
      )}
      {figmaUrl && (
        <a
          href={figmaUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-full border px-2 py-0.5 text-foreground no-underline hover:bg-muted"
        >
          Open in Figma
        </a>
      )}
    </div>
  )
}

function FigmaTable() {
  const rows = usePreparedMeta()?.parameters.figmaProps as FigmaProp[] | undefined
  if (!rows?.length) return null
  return (
    <>
      <h2 id="figma-to-code">Figma → code</h2>
      <p>
        Every Figma component property and what it is in code. Figma <code>state</code> is never a prop: it
        maps to a selector or, for agent lifecycles, to <code>status</code> (API Contract).
      </p>
      <table>
        <thead>
          <tr>
            <th>Figma property</th>
            <th>Values</th>
            <th>Code</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.property}>
              <td>
                <code>{row.property}</code>
              </td>
              <td>{row.values ?? '—'}</td>
              <td>{inlineCode(row.code)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export function AnvilDocsPage() {
  return (
    <>
      <Title />
      <Meta />
      <Subtitle />
      <Description />
      <Primary />
      <Controls />
      <FigmaTable />
      <Stories />
    </>
  )
}
