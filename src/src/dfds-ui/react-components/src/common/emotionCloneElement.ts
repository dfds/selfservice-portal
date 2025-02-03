import { jsx } from '@emotion/react'

// https://github.com/emotion-js/emotion/issues/1404
const emotionCloneElement = (element: any, config: any, ...children: any) => {
  return jsx(
    element.props['__EMOTION_TYPE_PLEASE_DO_NOT_USE__']
      ? element.props['__EMOTION_TYPE_PLEASE_DO_NOT_USE__']
      : element.type,
    {
      key: element.key !== null ? element.key : undefined,
      ref: element.ref,
      ...element.props,
      ...config,
    },
    ...children
  )
}

export default emotionCloneElement
