import React from 'react'

function useForwardedRef<T>(forwardedRef: ((instance: T | null) => void) | React.MutableRefObject<T | null> | null) {
  const innerRef = React.useRef<T>(null)

  React.useEffect(() => {
    if (!forwardedRef) {
      return
    }
    if (typeof forwardedRef === 'function') {
      forwardedRef(innerRef.current)
    } else {
      forwardedRef.current = innerRef.current
    }
  }, [forwardedRef])

  return innerRef
}

export default useForwardedRef
