import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Icon, RotateCcwIcon } from '@/components/ui/icon'

import { MessageAction, MessageActions } from './message-actions'
import {
  RegenerateMenu,
  RegenerateMenuContent,
  RegenerateMenuTrigger,
  type Modification,
} from './regenerate-menu'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10728-2250'

const MODELS = [
  { value: 'label-1', label: 'Label 1' },
  { value: 'label-2', label: 'Label 2' },
  { value: 'label-3', label: 'Label 3' },
]

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onTryAgain?: () => void
  onModify?: (modification: Modification) => void
  modal?: boolean
}

// modal={false} as in the Dropdown Menu stories: a modal menu marks the page aria-hidden while its
// trigger stays focusable, which axe flags in a story canvas.
function Demo({ open, onOpenChange, onTryAgain, onModify, modal = false }: DemoProps) {
  const [model, setModel] = useState('label-1')
  return (
    <MessageActions>
      <RegenerateMenu open={open} onOpenChange={onOpenChange} modal={modal}>
        <RegenerateMenuTrigger asChild>
          <MessageAction label="Retry">
            <Icon icon={RotateCcwIcon} />
          </MessageAction>
        </RegenerateMenuTrigger>
        <RegenerateMenuContent
          onTryAgain={onTryAgain}
          onModify={onModify}
          models={MODELS}
          model={model}
          onModelChange={setModel}
        />
      </RegenerateMenu>
    </MessageActions>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Messages/Regenerate Menu',
  tags: ['agent-block'],
  component: Demo,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Ways to redo an answer, opened from the retry action (`@/components/agent/regenerate-menu`, on Dropdown Menu). `RegenerateMenu` › `RegenerateMenuTrigger` (a MessageAction) + `RegenerateMenuContent` (`onTryAgain`, `onModify(shorter · longer · simpler · formal · casual)`, `models` / `model` / `onModelChange` for the Switch model submenu).',
      },
      story: { inline: false, height: '420px' },
    },
  },
  args: { open: false, modal: false, onTryAgain: fn(), onModify: fn() },
})

/** Click Retry; `open` is a live control. */
export const Default = meta.story()

Default.test(
  'Retry opens the menu; a choice reports what to change',
  async ({ canvas, canvasElement, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }))
    const menu = await within(canvasElement.ownerDocument.body).findByRole('menu')
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Shorter' }))
    await expect(args.onModify).toHaveBeenCalledWith('shorter')
  },
)

/** Open on load: the Figma drawing. */
export const Open = meta.story({ args: { open: true } })

Open.test('lists Try again, the modifications and Switch model', async ({ canvasElement }) => {
  const menu = await within(canvasElement.ownerDocument.body).findByRole('menu')
  for (const name of [
    /Try again/,
    'Shorter',
    'Longer',
    'Simpler',
    'More formal',
    'More casual',
    'Switch model',
  ]) {
    await expect(within(menu).getByRole('menuitem', { name })).toBeInTheDocument()
  }
})
