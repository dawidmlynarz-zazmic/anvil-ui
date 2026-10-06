import type { MouseEvent, ReactNode } from 'react'
import { Controls, Description, Primary, Stories, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks'
import { NAVIGATE_URL } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'

import { docsIdOf, relationshipsOf } from './relationships'
import { contextsOf, levelOf, shadcnUrl, type FigmaProp, type Guide } from './taxonomy'

// Docs page for every component (autodocs): title; badges for the level, the context and the
// shadcn/ui counterpart (linked), and the Figma link; the description (what it is, anatomy, API);
// Usage (`parameters.guide`: when to use, when not to, content, accessibility); Relationships
// (Built with / Used in, from the imports); the primary story with its controls; the Figma → code
// table; then every story.

/** Renders `code` spans from backticks. */
function inlineCode(text: string): ReactNode[] {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))
}

/** The component's prepared meta (tags, parameters). */
function usePreparedMeta() {
  const resolved = useOf('meta')
  return resolved.type === 'meta' ? resolved.preparedMeta : undefined
}

const badge = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5'

function Meta() {
  const preparedMeta = usePreparedMeta()
  if (!preparedMeta) return null
  const level = levelOf(preparedMeta.tags)
  const contexts = contextsOf(preparedMeta.tags)
  const shadcn = preparedMeta.parameters.shadcn as string | undefined
  const figmaUrl = (preparedMeta.parameters.design as { url?: string } | undefined)?.url
  if (!level && !figmaUrl) return null
  return (
    <div className="sb-unstyled not-prose mb-6 flex flex-wrap items-center gap-2 type-text-xs-medium">
      {level && (
        <span title={level.description} className={`${badge} bg-agent-subtle text-agent-strong`}>
          {level.label}
        </span>
      )}
      {contexts.map((context) => (
        <span key={context.tag} title={context.description} className={`${badge} bg-muted text-foreground`}>
          {context.label}
        </span>
      ))}
      {shadcn && (
        <a
          href={shadcnUrl(shadcn)}
          target="_blank"
          rel="noreferrer"
          title="The shadcn/ui component this is built on"
          className={`${badge} bg-foreground text-background no-underline hover:opacity-90`}
        >
          shadcn
        </a>
      )}
      {figmaUrl && (
        <a
          href={figmaUrl}
          target="_blank"
          rel="noreferrer"
          className={`${badge} border text-foreground no-underline hover:bg-muted`}
        >
          Open in Figma
        </a>
      )}
    </div>
  )
}

/** A link to another component's docs: navigates the manager (no reload); new-tab still works. */
function DocsLink({ title }: { title: string }) {
  const path = `/docs/${docsIdOf(title)}`
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    addons.getChannel().emit(NAVIGATE_URL, `?path=${path}`)
  }
  const parts = title.split('/')
  return (
    <a href={`/?path=${path}`} target="_top" onClick={onClick}>
      {parts.at(-1)}
      <span className="sb-unstyled type-text-xs-normal text-muted-foreground"> · {parts[0]}</span>
    </a>
  )
}

const GUIDE_SECTIONS: { key: keyof Guide; heading: string }[] = [
  { key: 'use', heading: 'When to use' },
  { key: 'avoid', heading: 'When not to use' },
  { key: 'content', heading: 'Content' },
  { key: 'a11y', heading: 'Accessibility' },
]

function Usage() {
  const guide = usePreparedMeta()?.parameters.guide as Guide | undefined
  if (!guide) return null
  return (
    <>
      <h2 id="usage">Usage</h2>
      {GUIDE_SECTIONS.map(({ key, heading }) =>
        guide[key]?.length ? (
          <div key={key}>
            <h3 id={`usage-${key}`}>{heading}</h3>
            <ul>
              {guide[key]!.map((line) => (
                <li key={line}>{inlineCode(line)}</li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
    </>
  )
}

function Relationships() {
  const title = usePreparedMeta()?.title
  if (!title) return null
  const { builtWith, usedIn } = relationshipsOf(title)
  if (!builtWith.length && !usedIn.length) return null
  return (
    <>
      <h2 id="relationships">Relationships</h2>
      {builtWith.length > 0 && (
        <>
          <p>
            <strong>Built with</strong> — the Anvil components inside it:
          </p>
          <ul>
            {builtWith.map((child) => (
              <li key={child}>
                <DocsLink title={child} />
              </li>
            ))}
          </ul>
        </>
      )}
      {usedIn.length > 0 && (
        <>
          <p>
            <strong>Used in</strong> — the Anvil components built with it:
          </p>
          <ul>
            {usedIn.map((parent) => (
              <li key={parent}>
                <DocsLink title={parent} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
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
      <Usage />
      <Relationships />
      <Primary />
      <Controls />
      <FigmaTable />
      <Stories />
    </>
  )
}
