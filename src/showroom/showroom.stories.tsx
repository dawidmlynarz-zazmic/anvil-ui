import preview from '#.storybook/preview'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Showroom } from './Showroom'

// The Showroom: a scripted assistant you can talk to, in every shell, on desktop or mobile, in light or dark.
// A story (not MDX) so it follows Storybook's toolbars and is tested in light and dark like everything else.
// docs/showroom.md lists the flows and the easter eggs.
const meta = preview.meta({
  title: 'Showroom',
  tags: ['!autodocs'],
  component: Showroom,
  parameters: {
    layout: 'fullscreen',
    options: { showPanel: false },
    docs: { story: { inline: false, height: '800px' } },
  },
  args: {
    speed: 'normal' as const,
    persist: true,
    defaultDevice: 'desktop' as const,
    defaultShell: 'side-panel' as const,
  },
  argTypes: {
    speed: {
      control: 'inline-radio',
      options: ['normal', 'fast', 'instant'],
      description: 'How fast the assistant types and acts',
    },
    persist: { control: 'boolean', description: 'Remember device, theme, shell and motion' },
    defaultDevice: { control: 'inline-radio', options: ['desktop', 'mobile'] },
    defaultShell: { control: 'inline-radio', options: ['full-screen', 'side-panel', 'popover'] },
  },
})

export const Assistant = meta.story()

/** Instant mode, nothing remembered: how the tests drive it. */
const instant = { speed: 'instant' as const, persist: false }

const input = (canvas: ReturnType<typeof within>) => canvas.getByRole('textbox', { name: 'Prompt' })

async function say(canvas: ReturnType<typeof within>, text: string) {
  await userEvent.type(input(canvas), `${text}{Enter}`)
}

Assistant.test('answers an easter egg, and a repeat differently', async ({ canvas }) => {
  await say(canvas, 'hello')
  await waitFor(() => expect(canvas.getByText(/Anvil demo assistant/)).toBeVisible())
  await say(canvas, 'hello')
  await waitFor(() => expect(canvas.getByText(/statistically my favourite user/)).toBeVisible())
})

export const Scripted = meta.story({ args: { ...instant, defaultShell: 'full-screen' } })

Scripted.test('plays a coin flip and a rock-paper-scissors round with quick replies', async ({ canvas }) => {
  await say(canvas, 'rock paper scissors')
  await userEvent.click(await canvas.findByRole('button', { name: 'Rock' }))
  await waitFor(() => expect(canvas.getByText(/I win!/)).toBeVisible())
})

Scripted.test('the order flow asks for approval and tracks the delivery', async ({ canvas }) => {
  await say(canvas, 'find me a daypack')
  await userEvent.click(await canvas.findByRole('button', { name: 'Order it' }))
  await userEvent.click(await canvas.findByRole('button', { name: 'Approve' }))
  await waitFor(() => expect(canvas.getByText('Out for delivery', { exact: false })).toBeVisible(), {
    timeout: 5000,
  })
})

Scripted.test('the booking flow goes from offers to tickets, one answer at a time', async ({ canvas }) => {
  await say(canvas, 'book tickets for a show')
  await userEvent.click((await canvas.findAllByRole('button', { name: 'View dates' }))[0])
  await userEvent.click(await canvas.findByRole('button', { name: /Saturday, October 17/ }))
  await userEvent.click(await canvas.findByRole('radio', { name: /19:30/ }))
  await userEvent.click(await canvas.findByRole('button', { name: 'Continue' }))
  await userEvent.click(await canvas.findByRole('button', { name: 'Approve' }))
  await waitFor(() => expect(canvas.getByText(/tickets-PK-91274\.pdf/)).toBeVisible(), { timeout: 15000 })
  await expect(canvas.getByText('Date chosen')).toBeVisible()
  await expect(canvas.getByText('Time chosen')).toBeVisible()
})

Scripted.test('the research flow runs from questions to a summary', async ({ canvas }) => {
  await say(canvas, 'research')
  await userEvent.click(await canvas.findByRole('button', { name: 'EU' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Update brief' }))
  await userEvent.click(await canvas.findByRole('button', { name: 'Approve & start' }))
  await userEvent.click(await canvas.findByRole('button', { name: 'Approve plan' }))
  await waitFor(() => expect(canvas.getByText('Research complete')).toBeVisible(), { timeout: 15000 })
  await userEvent.click(await canvas.findByRole('button', { name: 'Compare with enterprise pricing' }))
  await waitFor(() => expect(canvas.getByText(/Sales is “looking into it”/)).toBeVisible())
})

Scripted.test('Start over asks first, then clears the chat', async ({ canvas, canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await say(canvas, 'tell me a joke')
  await canvas.findByText(
    /designers prefer dark mode|QA engineer|hard things|UDP|therapy|design token|lightbulb|laptop/,
  )
  await userEvent.click(canvas.getAllByRole('button', { name: 'Start over' })[0])
  const dialog = await body.findByRole('alertdialog')
  await waitFor(() => expect(dialog).toBeVisible())
  await userEvent.click(await body.findByRole('button', { name: 'Keep chatting' }))
  await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull())
  await userEvent.click(canvas.getAllByRole('button', { name: 'Start over' })[0])
  const confirm = await body.findByRole('button', { name: 'Reset chat' })
  await waitFor(() => expect(confirm).toBeVisible())
  await userEvent.click(confirm)
  await waitFor(() => expect(canvas.getByText('Hi, I’m the Showroom assistant')).toBeVisible())
})

Scripted.test('the chat can change the setup: dark mode and mobile', async ({ canvas }) => {
  await say(canvas, 'dark mode')
  await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(true))
  await say(canvas, 'go mobile')
  await waitFor(() => expect(canvas.getByRole('radio', { name: 'Mobile' })).toBeChecked())
  await expect(canvas.getByRole('radio', { name: 'Side panel' })).toBeDisabled()
})
