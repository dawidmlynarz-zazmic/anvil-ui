import * as React from 'react'

import { cn } from '@/lib/utils'

// Figma Agent Builder › Core Kit › content block (10729:2391): the markdown blocks of an assistant
// answer. `ContentBlocks` styles the HTML a markdown renderer produces, so any renderer works:
// heading (h1–h2 heading/xl, h3–h4 text/base/semibold) · paragraph (text/base/normal) · bulleted
// list (--muted-foreground dot) and numbered list (text/base/medium --muted-foreground numbers),
// 6px apart · quote (text/base/normal; a <footer> or <cite> source in text/xs --muted-foreground) ·
// table (--border, radius lg; header row --muted, text/sm/semibold; cells 12/10px, text/sm) · code
// (pre: --background, --border, radius lg, 12px, code/xs; inline code on --muted) · divider (hr,
// --overlay-8, 8px above and below) · links (Link brand). Math: `ContentMath` (--muted, radius md,
// 12px, text/xs; Figma's --muted-foreground formula / --foreground-subtle caption are one step
// lighter in code — --foreground / --muted-foreground — since --foreground-subtle on --muted is under
// 4.5:1). Blocks sit 16px apart.

function ContentBlocks({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="content-blocks"
      className={cn(
        'flex min-w-0 flex-col gap-4 type-text-base-normal text-foreground',
        // headings
        '[&_h1]:type-heading-xl [&_h2]:type-heading-xl [&_h3]:type-text-base-semibold [&_h4]:type-text-base-semibold',
        // lists
        '[&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-1.5 [&_ol]:ps-6 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:ps-5',
        '[&_li]:ps-1 [&_ol>li]:marker:font-medium [&_li]:marker:text-muted-foreground',
        // quote
        '[&_blockquote]:flex [&_blockquote]:flex-col [&_blockquote]:gap-1 [&_blockquote_cite]:type-text-xs-normal [&_blockquote_cite]:text-muted-foreground [&_blockquote_cite]:not-italic [&_blockquote_footer]:type-text-xs-normal [&_blockquote_footer]:text-muted-foreground',
        // table
        '[&_table]:w-full [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border',
        '[&_th]:border-b [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:type-text-sm-semibold',
        '[&_td]:border-b [&_td]:px-3 [&_td]:py-2.5 [&_td]:type-text-sm-normal [&_tr:last-child>td]:border-b-0',
        // code
        '[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-background [&_pre]:p-3 [&_pre]:type-code-xs',
        '[&_:not(pre)>code]:rounded-sm [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:type-code-xs',
        // divider and links
        '[&_hr]:my-2 [&_hr]:h-px [&_hr]:border-0 [&_hr]:bg-overlay-8',
        '[&_a]:rounded-sm [&_a]:type-text-base-medium [&_a]:text-foreground-link [&_a]:underline-offset-4 [&_a]:outline-none [&_a]:hover:text-info-medium [&_a]:hover:underline [&_a]:focus-visible:focus-ring',
        className,
      )}
      {...props}
    />
  )
}

/** Figma type=math: a formula with an optional caption (render the formula with your math library). */
function ContentMath({
  caption,
  className,
  children,
  ...props
}: React.ComponentProps<'figure'> & { caption?: React.ReactNode }) {
  return (
    <figure
      data-slot="content-math"
      className={cn('m-0 flex flex-col gap-0.5 rounded-md bg-muted p-3 type-text-xs-normal', className)}
      {...props}
    >
      <div className="overflow-x-auto text-foreground">{children}</div>
      {caption && <figcaption className="text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}

export { ContentBlocks, ContentMath }
