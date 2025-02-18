/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from 'react'
const MOUSEDOWN = 'mousedown'
const TOUCHSTART = 'touchstart'

type HandledEvents = [typeof MOUSEDOWN, typeof TOUCHSTART]
type HandledEventsType = HandledEvents[number]
type PossibleEvent = {
  [Type in HandledEventsType]: HTMLElementEventMap[Type]
}[HandledEventsType]
type Handler = (...args: any[]) => void

const events: HandledEvents = [MOUSEDOWN, TOUCHSTART]

export default function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: Handler | null) {
  const isBrowser = typeof document !== 'undefined'

  if (!isBrowser) {
    return
  }

  const handlerRef = useLatest(handler)

  useEffect(() => {
    if (!handler) {
      return
    }

    const listener = (event: PossibleEvent) => {
      if (!ref.current || !handlerRef.current || ref.current.contains(event.target as Node)) {
        return
      }

      handlerRef.current(event)
    }

    events.forEach((event) => {
      document.addEventListener(event, listener)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, listener)
      })
    }
  }, [!handler])
}

function useLatest<T>(value: T) {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  })

  return ref
}
