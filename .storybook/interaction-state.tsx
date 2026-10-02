import type { Decorator } from '@storybook/react-vite'

/**
 * The "State" control: a Storybook-only arg that previews hover / focus / pressed without user
 * input. storybook-addon-pseudo-states rewrites every `:hover` rule to also match under
 * `.pseudo-hover-all` (and so on), so a wrapper with that class puts the story in the state.
 * The arg is removed before the story renders, so it never reaches a component as a prop.
 */
export const STATE_ARG = 'interactionState'

export type InteractionState = 'default' | 'hover' | 'focus-visible' | 'focus' | 'active'

export const withInteractionState: Decorator = (Story, context) => {
  const { [STATE_ARG]: state, ...args } = context.args
  const story = <Story args={args} />
  if (!state || state === 'default') return story
  return (
    <div className={`pseudo-${state as InteractionState}-all`} style={{ display: 'contents' }}>
      {story}
    </div>
  )
}
