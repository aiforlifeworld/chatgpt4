import { For, Show, createEffect, createSignal, on } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { createScrollPosition } from '@solid-primitives/scroll'
import { leading, throttle } from '@solid-primitives/scheduled'
import { isSendBoxFocus } from '@/stores/ui'
import MessageItem from './MessageItem'
import Charge from './Charge'
import type { Accessor, Setter } from 'solid-js'
import type { MessageInstance } from '@/types/message'
import type { User } from '@/types'

interface Props {
  conversationId: string
  messages: Accessor<MessageInstance[]>

  setUser: Setter<User>
  user: Accessor<User>
}

export default (props: Props) => {
  let scrollRef: HTMLDivElement
  const $isSendBoxFocus = useStore(isSendBoxFocus)
  const [isScrollBottom, setIsScrollBottom] = createSignal(false)
  const scroll = createScrollPosition(() => scrollRef)

  createEffect(() => {
    setIsScrollBottom(scroll.y + scrollRef.clientHeight >= scrollRef.scrollHeight - 100)
  })
  createEffect(on(() => props.conversationId, () => {
    setTimeout(() => {
      instantScrollToBottomThrottle(scrollRef)
    }, 0)
  }))

  const instantScrollToBottomThrottle = leading(throttle, (element: HTMLDivElement) => {
    isScrollBottom() && element.scrollTo({ top: element.scrollHeight })
  }, 250)

  const handleStreamableTextUpdate = () => {
    instantScrollToBottomThrottle(scrollRef)
  }

  return (
    <>
      <div class="scroll-list relative flex flex-col h-full overflow-y-scroll" ref={scrollRef!}>

        <div class="px-6 pb-2">
          <Charge
            setUser={props.setUser}
            user={props.user}
          />
        </div>
        <div class="px-6 text-gray-500 text-xs my-2">
          注意:连续对话字数消耗很快 (建议每次都开新对话)
        </div>
        <For each={props.messages()}>
          {(message, index) => (
            <div class="border-b border-lighter">
              <MessageItem
                conversationId={props.conversationId}
                message={message}
                handleStreaming={handleStreamableTextUpdate}
                // index={index()}
              />
            </div>
          )}
        </For>
      </div>
      <Show when={!isScrollBottom() && !$isSendBoxFocus()}>
        <div
          class="absolute bottom-0 left-0 right-0 border-t border-base bg-blur hv-base"
          onClick={() => scrollRef!.scrollTo({ top: scrollRef.scrollHeight, behavior: 'smooth' })}
        >
          <div class="fcc h-8 max-w-base text-xs op-50 gap-1">
            <div>Scroll to bottom</div>
            <div i-carbon-arrow-down />
          </div>
        </div>
      </Show>
    </>
  )
}
