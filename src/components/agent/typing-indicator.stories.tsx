import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BotIcon, Icon } from '@/components/ui/icon'
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message'

import { TypingIndicator } from './typing-indicator'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10734-2807'

const meta = preview.meta({
  title: 'Agent Primitives/Agent States/Typing Indicator',
  tags: ['agent-primitive'],
  component: TypingIndicator,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'frame',
        values: '1 · 2 · 3',
        code: 'animation frames of `animate-typing-dot` (not a prop)',
      },
    ],
    docs: {
      description: {
        component:
          'Three bouncing dots in a muted pill while the reply is being written (`@/components/agent/typing-indicator`, built on the Spinner pattern): a `role="status"` named by `label` (default "Typing"). The motion stops under reduced motion and with the Motion toolbar off.',
      },
    },
  },
  args: { label: 'Typing' },
  argTypes: { label: { control: 'text' } },
})

/** The accessible label is in Controls. */
export const Default = meta.story()

Default.test('is a named status with three dots', async ({ canvas }) => {
  const status = canvas.getByRole('status', { name: 'Typing' })
  await expect(status.children).toHaveLength(3)
})

/** In a thread, in place of the assistant's next message. */
export const InThread = meta.story({
  render: (args) => (
    <div className="w-(--shell-thread-max) max-w-full">
      <Message>
        <MessageAvatar>
          <Avatar size="xs">
            <AvatarFallback tone="agent">
              <Icon icon={BotIcon} />
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <TypingIndicator {...args} />
        </MessageContent>
      </Message>
    </div>
  ),
})
