// Links from a story or docs page to another Storybook page. Storybook can be served from a sub-path
// (GitHub Pages: /anvil-ui/), so URLs are built from where the preview iframe lives, never from `/`.
// The preview runs at <base>iframe.html; the manager page is <base>.

/** The manager URL for a Storybook path such as `/story/showroom--assistant` or `/docs/button--docs`. */
export function managerUrl(path: string) {
  return `${new URL('./', document.baseURI).pathname}?path=${path}`
}
